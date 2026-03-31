/** When `VITE_STORAGE_BACKEND=b2`, uploads go to Backblaze B2 via `/api/b2-storage` (Vercel). */

export function isB2StorageBackend() {
  return String(import.meta.env.VITE_STORAGE_BACKEND || '')
    .trim()
    .toLowerCase() === 'b2'
}

/** Base URL for Vercel `api/b2-storage`. */
export function b2StorageApiUrl() {
  const base = String(import.meta.env.VITE_B2_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
  return base ? `${base}/api/b2-storage` : '/api/b2-storage'
}

/**
 * @param {{ storagePath: string, file: File | Blob, contentType: string, getAccessToken: () => Promise<string|null> }} opts
 */
export async function uploadToB2({ storagePath, file, contentType, getAccessToken }) {
  const idToken = await getAccessToken()
  if (!idToken) throw new Error('Sign in required.')

  const params = new URLSearchParams({
    action: 'uploadFile',
    key: storagePath,
    contentType,
  })
  const r = await fetch(`${b2StorageApiUrl()}?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${idToken}`,
    },
    body: file,
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || `Upload failed (${r.status})`)

  const url = data.publicUrl || (data.key ? `b2ref://${data.key}` : '')
  return { url, storagePath }
}

/**
 * @param {{ storagePath: string, getAccessToken: () => Promise<string|null> }} opts
 */
export async function deleteFromB2({ storagePath, getAccessToken }) {
  const idToken = await getAccessToken()
  if (!idToken) throw new Error('Sign in required.')

  const r = await fetch(b2StorageApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ action: 'deleteObject', key: storagePath }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || `Delete failed (${r.status})`)
}
