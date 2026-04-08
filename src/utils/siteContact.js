import { defaultSiteContent } from '../content/defaultSiteContent'

/** Single source of truth for display: prefer `contact`, then legacy navbar/footer. */
export function getSitePhone(content) {
  const c = content || {}
  return String(
    c.contact?.phone || c.navbar?.phone || c.footer?.phone || defaultSiteContent.contact.phone
  ).trim()
}

export function getSiteEmail(content) {
  const c = content || {}
  return String(
    c.contact?.email || c.footer?.email || defaultSiteContent.contact.email
  ).trim()
}

export function getSiteAddress(content) {
  const c = content || {}
  return String(
    c.contact?.address || c.footer?.address || defaultSiteContent.contact.address
  ).trim()
}

/** Google Maps search URL for the store address; empty string if no address. */
export function googleMapsUrlForAddress(address) {
  const q = String(address || '').trim()
  if (!q) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

/**
 * Prefer saved short link / place URL; otherwise build a search URL from the address text.
 */
export function getStoreGoogleMapsUrl(content) {
  const c = content || {}
  const fixed = String(
    c.contact?.googleMapsUrl || c.footer?.googleMapsUrl || defaultSiteContent.contact.googleMapsUrl || ''
  ).trim()
  if (fixed) return fixed
  return googleMapsUrlForAddress(getSiteAddress(content))
}

export function getSiteWhatsAppDigits(content) {
  const c = content || {}
  // Only use explicitly configured WhatsApp number from Admin.
  // Do not fall back to phone/defaults to avoid opening wrong chats.
  const raw = String(c.contact?.whatsappNumber || '')
  return raw.replace(/\D/g, '')
}

/**
 * After editing `contact` in Admin, copy the same values to `navbar.phone` and
 * `footer.phone` / `footer.email` / `footer.address` so the whole site stays in sync.
 */
export function mirrorContactToNavbarFooter(draft) {
  const phone = String(draft.contact?.phone || '').trim()
  const email = String(draft.contact?.email || '').trim()
  const address = String(draft.contact?.address || '').trim()
  const wa = String(draft.contact?.whatsappNumber || '').trim()
  const googleMapsUrl = String(draft.contact?.googleMapsUrl || '').trim()
  return {
    ...draft,
    contact: {
      ...(draft.contact || {}),
      phone,
      email,
      address,
      whatsappNumber: wa,
      googleMapsUrl,
    },
    navbar: { ...(draft.navbar || {}), phone },
    footer: {
      ...(draft.footer || {}),
      phone,
      email,
      address,
      googleMapsUrl,
    },
  }
}
