import { COUPON_EXPIRY_DAYS } from './googleReviews'

/** Server-side env vars are checked in /api/send-coupon-email. */
export function getMissingCouponEmailEnvVars() {
  return []
}

export function isCouponEmailConfigured() {
  return true
}

/**
 * Sends coupon details via our backend API route.
 * Local dev: Vite serves POST /api/send-coupon-email on the same port (see vite.config.js).
 * Production: Vercel serverless api/send-coupon-email.js.
 */
export async function sendCouponEmail({
  customerName,
  customerEmail,
  couponCode,
  offerLabel,
  validFrom,
  validTill,
}) {
  if (!isCouponEmailConfigured()) {
    return { ok: false, skipped: true, reason: 'not-configured' }
  }

  const email = String(customerEmail || '').trim()
  if (!email) {
    return { ok: false, skipped: true, reason: 'no-email' }
  }

  const base = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')
  const url = `${base}/api/send-coupon-email`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: String(customerName || 'Customer'),
        customerEmail: email,
        couponCode: String(couponCode ?? ''),
        offerLabel: String(offerLabel ?? ''),
        validFrom,
        validTill,
        validityDays: COUPON_EXPIRY_DAYS,
      }),
    })

    const text = await response.text()
    let parsed = {}
    try {
      parsed = text ? JSON.parse(text) : {}
    } catch {
      // ignore
    }

    if (!response.ok) {
      let detail = parsed?.error || parsed?.message || text || ''
      const missing = Array.isArray(parsed?.missing) ? parsed.missing.join(', ') : ''
      if (response.status === 503 && /not configured/i.test(String(detail))) {
        return {
          ok: false,
          skipped: true,
          reason: 'not-configured',
          detail: missing ? `${detail} Missing: ${missing}.` : detail,
        }
      }
      return { ok: false, detail: `(${response.status}) ${detail}` }
    }

    return { ok: true, messageId: parsed.messageId ?? null }
  } catch (err) {
    return { ok: false, error: err, detail: err?.message || 'Network error' }
  }
}
