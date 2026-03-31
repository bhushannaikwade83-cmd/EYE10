/** Normalize product `features` (array of strings). */
export function normalizeFeatureList(product) {
  const raw = product?.features
  if (!Array.isArray(raw)) return []
  return raw.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean)
}

/**
 * Normalize `benefits`: strings or { title, subtitle } / { label, text }.
 */
export function normalizeBenefitList(product) {
  const raw = product?.benefits
  if (!Array.isArray(raw)) return []
  return raw
    .map((b) => {
      if (typeof b === 'string') {
        const t = b.trim()
        return t ? { title: t, subtitle: '' } : null
      }
      if (b && typeof b === 'object') {
        const title = String(b.title ?? b.label ?? '').trim()
        const subtitle = String(b.subtitle ?? b.text ?? '').trim()
        if (!title && !subtitle) return null
        return { title: title || '—', subtitle }
      }
      return null
    })
    .filter(Boolean)
}

/** Short logo initials from brand name (e.g. "Tom Ford" → "TF"). */
export function brandLogoFromName(name) {
  const s = String(name || '').trim()
  if (!s) return '?'
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return s.slice(0, 2).toUpperCase()
}
