import { supabase } from '../supabase/client'

const ADMIN_CACHE_KEY = 'eye10_admin_cache_v1'
const ADMIN_CACHE_TTL_MS = 5 * 60 * 1000

function readAdminCache() {
  try {
    const raw = window.sessionStorage.getItem(ADMIN_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (Number(parsed.expiresAt || 0) < Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

function writeAdminCache(uid, ok) {
  try {
    window.sessionStorage.setItem(
      ADMIN_CACHE_KEY,
      JSON.stringify({
        uid: String(uid || ''),
        ok: Boolean(ok),
        expiresAt: Date.now() + ADMIN_CACHE_TTL_MS,
      })
    )
  } catch {
    // ignore cache failures
  }
}

/**
 * Admin access: row in `public.admins` with `user_id` = auth user id.
 * Add via Supabase Dashboard → Table Editor → admins (or SQL): insert user UUID from Authentication.
 */
export async function isAdminUser(uid) {
  if (!uid || !supabase) return false

  const cached = readAdminCache()
  if (cached && cached.uid === uid) return Boolean(cached.ok)

  // Prefer DB function because it runs as security definer and avoids RLS false negatives.
  const query = supabase.rpc('is_admin')
  const timeout = new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error('Admin check timed out. Check Supabase network/policies.')), 3500)
  })
  const { data, error } = await Promise.race([query, timeout])
  const ok = !error && Boolean(data === true)
  writeAdminCache(uid, ok)
  return ok
}

