import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
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
    let unsubscribe = null

    if (!db) {
      setContent(defaultSiteContent)
      setLoading(false)
      return
    }

    try {
      const ref = doc(db, 'siteContent', 'main')
      unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          const data = snapshot.exists() ? snapshot.data() : {}
          setContent(mergeSiteContent(data))
          setLoading(false)
        },
        () => {
          setContent(defaultSiteContent)
          setLoading(false)
        }
      )
    } catch (_) {
      setContent(defaultSiteContent)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const saveContent = async (nextContent) => {
    if (!db) {
      throw new Error('Firebase is not configured. Add VITE_FIREBASE_* env vars and redeploy.')
    }
    const ref = doc(db, 'siteContent', 'main')
    const payload = {
      ...nextContent,
      updatedAt: serverTimestamp(),
    }
    await setDoc(ref, payload, { merge: true })
  }

  const value = useMemo(
    () => ({
      content,
      loading,
      saveContent,
    }),
    [content, loading]
  )

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent() {
  return useContext(SiteContentContext)
}
