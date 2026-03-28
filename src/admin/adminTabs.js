/** Valid ?tab= values for /admin (overview = no query). */
export const ADMIN_TAB_KEYS = [
  'overview',
  'enquiries',
  'orders',
  'content',
  'catalogue',
  'products',
  'featured',
  'banners',
  'coupons',
]

export const ADMIN_TAB_SET = new Set(ADMIN_TAB_KEYS)

/** React Router path for a given admin section. */
export function adminTabPath(tab) {
  if (!ADMIN_TAB_SET.has(tab)) return '/admin'
  if (tab === 'overview') return '/admin'
  return `/admin?tab=${encodeURIComponent(tab)}`
}

/** Current admin tab from `location.search` (use `location.search` as React dep, not URLSearchParams object). */
export function getAdminTabFromLocation(search) {
  const params = new URLSearchParams(search || '')
  const raw = (params.get('tab') || 'overview').trim()
  return ADMIN_TAB_SET.has(raw) ? raw : 'overview'
}
