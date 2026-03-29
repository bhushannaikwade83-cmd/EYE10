import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let supabaseAdmin = null

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin
  const url = String(process.env.SUPABASE_URL || '').trim()
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  supabaseAdmin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return supabaseAdmin
}

async function verifyAdminBearer(jwt) {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.auth.getUser(jwt)
  if (error || !data?.user) {
    return { ok: false, reason: 'Invalid token' }
  }
  const { data: row, error: adminErr } = await sb
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (adminErr || !row) {
    return { ok: false, reason: 'Not an admin' }
  }
  return { ok: true, user: data.user }
}

function getS3Client() {
  const endpoint = String(process.env.B2_S3_ENDPOINT || '').trim()
  const region = String(process.env.B2_S3_REGION || 'us-west-004').trim()
  const accessKeyId = String(process.env.B2_APPLICATION_KEY_ID || '').trim()
  const secretAccessKey = String(process.env.B2_APPLICATION_KEY || '').trim()
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error('B2_S3_ENDPOINT, B2_APPLICATION_KEY_ID, or B2_APPLICATION_KEY missing')
  }
  return new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  })
}

function normalizeKey(key) {
  const k = String(key || '')
    .trim()
    .replace(/^\/+/, '')
  if (!k || k.includes('..')) return null
  return k
}

function isAllowedPrefix(key) {
  return (
    key.startsWith('catalogue/') ||
    key.startsWith('product-media/') ||
    key.startsWith('home-banners/')
  )
}

function validatePresign(key, contentType, contentLength) {
  const ct = String(contentType || '')
  const len = Number(contentLength)
  if (!Number.isFinite(len) || len < 1) return 'Invalid content length'

  if (key.startsWith('catalogue/')) {
    if (ct !== 'application/pdf') return 'Catalogue files must be PDF'
    if (len > 25 * 1024 * 1024) return 'PDF too large (max 25 MB)'
    return null
  }

  if (key.startsWith('home-banners/')) {
    const ok =
      ct === 'image/jpeg' ||
      ct === 'image/png' ||
      ct === 'video/mp4' ||
      ct === 'video/webm' ||
      ct === 'video/quicktime'
    if (!ok) return 'Invalid banner media type'
    const isVid = ct.startsWith('video/')
    if (isVid) {
      if (len > 42 * 1024 * 1024) return 'Video too large (max 42 MB)'
    } else if (len > 10 * 1024 * 1024) {
      return 'Image too large (max 10 MB)'
    }
    return null
  }

  if (key.startsWith('product-media/')) {
    const m = key.match(/^product-media\/[^/]+\/(images|videos)\//)
    if (!m) return 'Invalid product media path'
    if (m[1] === 'images') {
      if (ct !== 'image/jpeg' && ct !== 'image/png') return 'Images must be JPEG or PNG'
      if (len > 10 * 1024 * 1024) return 'Image too large (max 10 MB)'
    } else {
      const ok =
        ct === 'video/mp4' || ct === 'video/webm' || ct === 'video/quicktime'
      if (!ok) return 'Invalid video type'
      if (len > 45 * 1024 * 1024) return 'Video too large (max 45 MB)'
    }
    return null
  }

  return 'Unsupported path'
}

function publicUrlForKey(key) {
  const base = String(process.env.B2_FILE_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
  if (!base) return null
  const encoded = key.split('/').map((s) => encodeURIComponent(s)).join('/')
  return `${base}/${encoded}`
}

async function readJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}')
    } catch {
      return {}
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf8') || '{}')
    } catch {
      return {}
    }
  }
  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString('utf8')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = await readJsonBody(req)
    const action = body.action
    const bucket = String(process.env.B2_BUCKET || '').trim()
    if (!bucket) {
      res.status(500).json({ error: 'B2_BUCKET is not set' })
      return
    }

    // Anonymous read for storefront: private bucket + presigned GET (whitelist keys only).
    if (action === 'presignGet') {
      const key = normalizeKey(body.key)
      if (!key || !isAllowedPrefix(key)) {
        res.status(400).json({ error: 'Invalid key' })
        return
      }
      const client = getS3Client()
      const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
      const getUrl = await getSignedUrl(client, cmd, { expiresIn: 3600 })
      res.status(200).json({ getUrl, expiresIn: 3600 })
      return
    }

    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
    if (!token) {
      res.status(401).json({ error: 'Missing Authorization Bearer token' })
      return
    }

    const authResult = await verifyAdminBearer(token)
    if (!authResult.ok) {
      res.status(authResult.reason === 'Invalid token' ? 401 : 403).json({
        error: authResult.reason === 'Invalid token' ? 'Invalid or expired token' : 'Not an admin',
      })
      return
    }

    if (action === 'presignPut') {
      const key = normalizeKey(body.key)
      if (!key || !isAllowedPrefix(key)) {
        res.status(400).json({ error: 'Invalid key' })
        return
      }
      const err = validatePresign(key, body.contentType, body.contentLength)
      if (err) {
        res.status(400).json({ error: err })
        return
      }

      const client = getS3Client()
      const cmd = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: String(body.contentType || ''),
      })
      const putUrl = await getSignedUrl(client, cmd, { expiresIn: 900 })
      const publicUrl = publicUrlForKey(key)
      res.status(200).json({ putUrl, publicUrl, key })
      return
    }

    if (action === 'deleteObject') {
      const key = normalizeKey(body.key)
      if (!key || !isAllowedPrefix(key)) {
        res.status(400).json({ error: 'Invalid key' })
        return
      }

      const client = getS3Client()
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
      res.status(200).json({ ok: true })
      return
    }

    res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    console.error('[b2-storage]', e)
    res.status(500).json({ error: e?.message || 'Server error' })
  }
}
