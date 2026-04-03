import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

export const config = {
  api: { bodyParser: false },
}

let supabaseAdmin = null
let b2AuthCache = null

function env(...keys) {
  for (const k of keys) {
    const v = String(process.env[k] || '').trim()
    if (v) return v
  }
  return ''
}

function requireB2Config() {
  const keyId = env('B2B_KEY_ID')
  const applicationKey = env('B2B_APPLICATION_KEY')
  const bucketName = env('B2B_BUCKET_NAME')
  const bucketId = env('B2B_BUCKET_ID')
  const fileBaseUrl = env('B2B_FILE_BASE_URL')
  if (!keyId || !applicationKey || !bucketName || !bucketId) {
    throw new Error(
      'Missing B2B config. Set B2B_KEY_ID, B2B_APPLICATION_KEY, B2B_BUCKET_NAME, and B2B_BUCKET_ID.'
    )
  }
  return { keyId, applicationKey, bucketName, bucketId, fileBaseUrl }
}

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
  if (error || !data?.user) return { ok: false, reason: 'Invalid token' }
  const { data: row, error: adminErr } = await sb
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (adminErr || !row) return { ok: false, reason: 'Not an admin' }
  return { ok: true, user: data.user }
}

async function b2AuthorizeAccount() {
  const now = Date.now()
  if (b2AuthCache && b2AuthCache.expiresAt > now) return b2AuthCache
  const { keyId, applicationKey } = requireB2Config()
  const basic = Buffer.from(`${keyId}:${applicationKey}`).toString('base64')
  const r = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: { Authorization: `Basic ${basic}` },
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.message || `b2_authorize_account failed (${r.status})`)
  b2AuthCache = {
    apiUrl: data.apiUrl,
    downloadUrl: data.downloadUrl,
    authorizationToken: data.authorizationToken,
    expiresAt: now + 23 * 60 * 60 * 1000,
  }
  return b2AuthCache
}

async function b2ApiPost(apiUrl, path, authorizationToken, body) {
  const r = await fetch(`${apiUrl}/b2api/v2/${path}`, {
    method: 'POST',
    headers: {
      Authorization: authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.message || `${path} failed (${r.status})`)
  return data
}

function normalizeKey(key) {
  const k = String(key || '').trim().replace(/^\/+/, '')
  if (!k || k.includes('..')) return null
  return k
}

function safeDownloadFilename(name, fallback = 'catalogue.pdf') {
  const raw = String(name || '').trim()
  if (!raw) return fallback
  const cleaned = raw.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, ' ').trim()
  if (!cleaned) return fallback
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`
}

function isAllowedPrefix(key) {
  return (
    key.startsWith('catalogue/') ||
    key.startsWith('product-media/') ||
    key.startsWith('home-banners/')
  )
}

function validateUpload(key, contentType, contentLength) {
  const ct = String(contentType || '')
  const len = Number(contentLength)
  if (!Number.isFinite(len) || len < 1) return 'Invalid content length'

  if (key.startsWith('catalogue/')) {
    if (ct !== 'application/pdf') return 'Catalogue files must be PDF'
    if (len > 25 * 1024 * 1024) return 'PDF too large (max 25 MB)'
    return null
  }

  if (key.startsWith('home-banners/')) {
    const ok = ct === 'image/jpeg' || ct === 'image/png' || ct === 'video/mp4' || ct === 'video/webm' || ct === 'video/quicktime'
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
      const ok = ct === 'video/mp4' || ct === 'video/webm' || ct === 'video/quicktime'
      if (!ok) return 'Invalid video type'
      if (len > 45 * 1024 * 1024) return 'Video too large (max 45 MB)'
    }
    return null
  }

  return 'Unsupported path'
}

function publicUrlForKey(key, downloadUrl, bucketName, overrideBase) {
  const base = String(overrideBase || '').trim().replace(/\/$/, '')
  if (base) {
    const encoded = key.split('/').map((s) => encodeURIComponent(s)).join('/')
    return `${base}/${encoded}`
  }
  const encoded = key.split('/').map((s) => encodeURIComponent(s)).join('/')
  return `${downloadUrl}/file/${encodeURIComponent(bucketName)}/${encoded}`
}

async function readJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body
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
    const raw = (await readRawBody(req)).toString('utf8')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    const query = req.query || {}
    const action = String(query.action || '').trim()
    if (action === 'downloadFile') {
      try {
        const key = normalizeKey(query.key)
        const forceDownload = String(query.download || '').trim() === '1'
        const requestedFileName = safeDownloadFilename(query.filename, key.split('/').pop() || 'catalogue.pdf')
        if (!key || !isAllowedPrefix(key)) {
          res.status(400).json({ error: 'Invalid key' })
          return
        }
        const { bucketName, bucketId } = requireB2Config()
        const auth = await b2AuthorizeAccount()
        const tokenData = await b2ApiPost(auth.apiUrl, 'b2_get_download_authorization', auth.authorizationToken, {
          bucketId,
          fileNamePrefix: key,
          validDurationInSeconds: 3600,
        })
        const encoded = key.split('/').map((s) => encodeURIComponent(s)).join('/')
        const upstreamUrl = `${auth.downloadUrl}/file/${encodeURIComponent(bucketName)}/${encoded}`
        const upstream = await fetch(upstreamUrl, {
          method: req.method === 'HEAD' ? 'HEAD' : 'GET',
          headers: { Authorization: tokenData.authorizationToken },
        })
        if (!upstream.ok) {
          const text = await upstream.text().catch(() => '')
          res.status(upstream.status).send(text || `Download failed (${upstream.status})`)
          return
        }
        const ct = upstream.headers.get('content-type') || 'application/octet-stream'
        const cd = upstream.headers.get('content-disposition')
        const cl = upstream.headers.get('content-length')
        res.setHeader('Content-Type', ct)
        if (forceDownload) {
          res.setHeader('Content-Disposition', `attachment; filename="${requestedFileName}"`)
        } else if (cd) {
          res.setHeader('Content-Disposition', cd)
        }
        if (cl) res.setHeader('Content-Length', cl)
        if (req.method === 'HEAD') {
          res.status(200).end()
          return
        }
        const ab = await upstream.arrayBuffer()
        res.status(200).send(Buffer.from(ab))
        return
      } catch (e) {
        res.status(500).json({ error: e?.message || 'Download proxy failed' })
        return
      }
    }
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const query = req.query || {}
    const queryAction = String(query.action || '').trim()

    if (queryAction === 'uploadFile') {
      const key = normalizeKey(query.key)
      const contentType = String(req.headers['content-type'] || query.contentType || '').trim()
      const body = await readRawBody(req)
      if (!key || !isAllowedPrefix(key)) {
        res.status(400).json({ error: 'Invalid key' })
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

      const validationError = validateUpload(key, contentType, body.length)
      if (validationError) {
        res.status(400).json({ error: validationError })
        return
      }

      const { bucketName, bucketId, fileBaseUrl } = requireB2Config()
      const auth = await b2AuthorizeAccount()
      const uploadInfo = await b2ApiPost(auth.apiUrl, 'b2_get_upload_url', auth.authorizationToken, { bucketId })
      const sha1 = createHash('sha1').update(body).digest('hex')
      const uploadRes = await fetch(uploadInfo.uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: uploadInfo.authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(key),
          'Content-Type': contentType,
          'X-Bz-Content-Sha1': sha1,
        },
        body,
      })
      const uploadData = await uploadRes.json().catch(() => ({}))
      if (!uploadRes.ok) {
        res.status(uploadRes.status).json({ error: uploadData.message || `Upload failed (${uploadRes.status})` })
        return
      }

      res.status(200).json({
        key,
        fileId: uploadData.fileId,
        publicUrl: publicUrlForKey(key, auth.downloadUrl, bucketName, fileBaseUrl),
      })
      return
    }

    const body = await readJsonBody(req)
    const action = String(body.action || '').trim()
    const { bucketName, bucketId } = requireB2Config()
    const auth = await b2AuthorizeAccount()

    if (action === 'presignGet') {
      const key = normalizeKey(body.key)
      if (!key || !isAllowedPrefix(key)) {
        res.status(400).json({ error: 'Invalid key' })
        return
      }
      const tokenData = await b2ApiPost(auth.apiUrl, 'b2_get_download_authorization', auth.authorizationToken, {
        bucketId,
        fileNamePrefix: key,
        validDurationInSeconds: 3600,
      })
      const encoded = key.split('/').map((s) => encodeURIComponent(s)).join('/')
      const getUrl =
        `${auth.downloadUrl}/file/${encodeURIComponent(bucketName)}/${encoded}` +
        `?Authorization=${encodeURIComponent(tokenData.authorizationToken)}`
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

    if (action === 'deleteObject') {
      const key = normalizeKey(body.key)
      if (!key || !isAllowedPrefix(key)) {
        res.status(400).json({ error: 'Invalid key' })
        return
      }
      const listed = await b2ApiPost(auth.apiUrl, 'b2_list_file_names', auth.authorizationToken, {
        bucketId,
        prefix: key,
        maxFileCount: 1,
      })
      const match = Array.isArray(listed.files) ? listed.files.find((f) => f.fileName === key) : null
      if (!match?.fileId) {
        res.status(200).json({ ok: true, message: 'File already absent' })
        return
      }
      await b2ApiPost(auth.apiUrl, 'b2_delete_file_version', auth.authorizationToken, {
        fileName: key,
        fileId: match.fileId,
      })
      res.status(200).json({ ok: true })
      return
    }

    res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    console.error('[b2-storage]', e)
    res.status(500).json({ error: e?.message || 'Server error' })
  }
}
