import { useEffect, useState } from 'react'
import { isB2PrivateBucketMode, resolveB2MediaUrl } from '../utils/b2PrivateUrls'

/**
 * Resolves media URLs for display.
 * @param {string} storedUrl
 * @returns {{ url: string, loading: boolean }}
 */
export function useResolvedMediaUrl(storedUrl) {
  const [url, setUrl] = useState(() =>
    isB2PrivateBucketMode() ? '' : String(storedUrl || '')
  )
  const [loading, setLoading] = useState(() =>
    Boolean(isB2PrivateBucketMode() && String(storedUrl || '').trim())
  )

  useEffect(() => {
    const s = String(storedUrl || '').trim()
    if (!s) {
      setUrl('')
      setLoading(false)
      return
    }
    if (!isB2PrivateBucketMode()) {
      setUrl(s)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    resolveB2MediaUrl(s)
      .then((u) => {
        if (!cancelled) {
          setUrl(u)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUrl(s)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [storedUrl])

  return { url, loading }
}

/**
 * @param {string[]} urls
 * @returns {{ urls: string[], loading: boolean }}
 */
export function useResolvedMediaUrls(urls) {
  const list = Array.isArray(urls) ? urls : []
  const key = list.join('\0')

  const [state, setState] = useState(() => ({
    urls: isB2PrivateBucketMode() ? list.map(() => '') : [...list],
    loading: isB2PrivateBucketMode() && list.some(Boolean),
  }))

  useEffect(() => {
    const arr = Array.isArray(urls) ? urls : []
    if (arr.length === 0) {
      setState({ urls: [], loading: false })
      return
    }
    if (!isB2PrivateBucketMode()) {
      setState({ urls: [...arr], loading: false })
      return
    }

    let cancelled = false
    setState((prev) => ({ ...prev, loading: true }))
    Promise.all(arr.map((u) => (u ? resolveB2MediaUrl(u) : Promise.resolve(''))))
      .then((resolved) => {
        if (!cancelled) setState({ urls: resolved, loading: false })
      })
      .catch(() => {
        if (!cancelled) setState({ urls: [...arr], loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [key])

  return state
}
