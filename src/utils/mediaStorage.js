import { supabase } from '../supabase/client'
import { isB2StorageBackend, b2StorageApiUrl } from './mediaStorageB2'

export { isB2StorageBackend, b2StorageApiUrl } from './mediaStorageB2'

export function canUseAdminStorage() {
  if (isB2StorageBackend()) return true
  return Boolean(supabase)
}

async function getSupabaseSessionToken() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

/**
 * @param {{ storagePath: string, file: File | Blob, contentType?: string }} opts
 * @returns {Promise<{ url: string, storagePath: string }>}
 */
export async function uploadAdminFile({ storagePath, file, contentType }) {
  const ct = contentType || file.type || 'application/octet-stream'

  if (isB2StorageBackend()) {
    const { uploadToB2 } = await import('./mediaStorageB2')
    return uploadToB2({ storagePath, file, contentType: ct, getAccessToken: getSupabaseSessionToken })
  }

  if (!supabase) throw new Error('Supabase is not configured (needed for storage when not using B2).')
  const { data, error } = await supabase.storage.from('media').upload(storagePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: ct,
  })
  if (error) throw new Error(error.message)
  if (!data?.path) throw new Error('Upload failed')

  const { data: pub } = supabase.storage.from('media').getPublicUrl(data.path)
  return { url: pub.publicUrl, storagePath: data.path }
}

export async function deleteAdminFile(storagePath) {
  if (!storagePath) return

  if (isB2StorageBackend()) {
    const { deleteFromB2 } = await import('./mediaStorageB2')
    return deleteFromB2({ storagePath, getAccessToken: getSupabaseSessionToken })
  }

  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.storage.from('media').remove([storagePath])
  if (error) throw new Error(error.message)
}
