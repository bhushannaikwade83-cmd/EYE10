import { supabase } from '../supabase/client'

/**
 * Admin access: row in `public.admins` with `user_id` = auth user id.
 * Add via Supabase Dashboard → Table Editor → admins (or SQL): insert user UUID from Authentication.
 */
export async function isAdminUser(uid) {
  if (!uid || !supabase) return false
  const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', uid).maybeSingle()
  if (error) return false
  return Boolean(data)
}

