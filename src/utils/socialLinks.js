/** Ensure footer/social URLs are absolute https for external links. */
export function normalizeExternalUrl(raw) {
  const t = String(raw || '').trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t.replace(/^\/+/, '')}`
}
