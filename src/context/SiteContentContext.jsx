import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase/client'
import { defaultSiteContent, mergeSiteContent } from '../content/defaultSiteContent'

const SiteContentContext = createContext({
  content: defaultSiteContent,
  loading: true,
  saveContent: async () => {},
})

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(defaultSiteContent)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) {
      setContent(defaultSiteContent)
      setLoading(false)
      return undefined
    }

    let cancelled = false

    const applyRow = (row) => {
      const raw = row?.data && typeof row.data === 'object' ? row.data : {}
      setContent(mergeSiteContent(raw))
      setLoading(false)
    }

    const load = async () => {
      const { data, error } = await supabase.from('site_content').select('data').eq('id', 'main').maybeSingle()
      if (cancelled) return
      if (error || !data) {
        setContent(defaultSiteContent)
        setLoading(false)
        return
      }
      applyRow(data)
    }

    void load()

    const channel = supabase
      .channel('site_content_main')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_content', filter: 'id=eq.main' },
        (payload) => {
          const row = payload.new
          if (row?.data) applyRow(row)
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [])

  const saveContent = async (nextContent) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    }
    const payload = {
      ...nextContent,
      updatedAt: new Date().toISOString(),
    }
    const { error } = await supabase.from('site_content').upsert(
      {
        id: 'main',
        data: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    if (error) throw error
  }

  const value = useMemo(
    () => ({
      content,
      loading,
      saveContent,
    }),
    [content, loading]
  )

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  return useContext(SiteContentContext)
}
