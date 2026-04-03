export function isB2PrivateBucketMode() {
  const backend = String(import.meta.env.VITE_STORAGE_BACKEND || '').trim().toLowerCase()
  return (
    backend === 'b2' &&
    String(import.meta.env.VITE_B2_PRIVATE_BUCKET || '').trim().toLowerCase() === 'true'
  )
}

/**
 * Derive a B2 object key from stored site data: raw path, friendly B2 URL, or `b2ref://key` from uploads.
 */
export function extractB2ObjectKey(stored) {
  const s = String(stored || '').trim()
  if (!s || s.includes('..')) return null

  if (s.startsWith('b2ref://')) {
    return normalizeKey(s.slice('b2ref://'.length))
  }

  if (/^(catalogue|product-media|home-banners)\//.test(s)) {
    return normalizeKey(s)
  }

  try {
    const u = new URL(s)
    if (!u.hostname.includes('backblazeb2.com')) return null
    const path = u.pathname
    const marker = '/file/'
    const i = path.indexOf(marker)
    if (i === -1) return null
    const rest = path.slice(i + marker.length)
    const parts = rest.split('/').filter(Boolean)
    if (parts.length < 2) return null
    return normalizeKey(parts.slice(1).join('/'))
  } catch {
    return null
  }
}

function normalizeKey(key) {
  const k = String(key || '')
    .trim()
    .replace(/^\/+/, '')
  if (!k || k.includes('..')) return null
  return k
}

const CACHE_MS = 55 * 60 * 1000
const cache = new Map()

/**
 * Returns a URL suitable for <img src>, <video src>, or window.open (PDF).
 * Non-B2 or public B2: returns `stored` unchanged.
 */
export async function resolveB2MediaUrl(stored) {
  const s = String(stored || '').trim()
  if (!s) return s
  if (!isB2PrivateBucketMode()) return s

  const objectKey = extractB2ObjectKey(s)
  if (!objectKey) return s

  const now = Date.now()
  const hit = cache.get(objectKey)
  if (hit && hit.expiresAt > now) return hit.url

  const base = String(import.meta.env.VITE_B2_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
  const proxyUrl = `${base ? `${base}/api/b2-storage` : '/api/b2-storage'}?action=downloadFile&key=${encodeURIComponent(
    objectKey
  )}`
  cache.set(objectKey, { url: proxyUrl, expiresAt: now + CACHE_MS })
  return proxyUrl
}

export function buildB2DownloadProxyUrl(stored, opts = {}) {
  const s = String(stored || '').trim()
  if (!s || !isB2PrivateBucketMode()) return s
  const objectKey = extractB2ObjectKey(s)
  if (!objectKey) return s

  const base = String(import.meta.env.VITE_B2_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
  const params = new URLSearchParams({
    action: 'downloadFile',
    key: objectKey,
  })
  if (opts.download) params.set('download', '1')
  if (opts.filename) params.set('filename', String(opts.filename))
  return `${base ? `${base}/api/b2-storage` : '/api/b2-storage'}?${params.toString()}`
}
