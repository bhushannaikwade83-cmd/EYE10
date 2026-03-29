import { createClient } from '@supabase/supabase-js'

function envTrim(key) {
  return String(import.meta.env[key] ?? '').trim()
}

const url = envTrim('VITE_SUPABASE_URL')
const anonKey = envTrim('VITE_SUPABASE_ANON_KEY')

export function isSupabaseConfigured() {
  return Boolean(url && anonKey)
}

/** Browser client (anon key + RLS). */
export const supabase = isSupabaseConfigured()
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
