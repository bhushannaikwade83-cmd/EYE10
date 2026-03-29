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

  try {
    const response = await fetch('/api/send-coupon-email', {
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

    if (!response.ok) {
      let detail = ''
      try {
        const parsed = await response.json()
        detail = parsed?.error || parsed?.message || ''
        if (response.status === 503 && /not configured/i.test(detail)) {
          return { ok: false, skipped: true, reason: 'not-configured', detail }
        }
      } catch (_) {
        detail = await response.text()
      }
      return { ok: false, detail: `(${response.status}) ${detail}` }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: err, detail: err?.message || 'Network error' }
  }
}
