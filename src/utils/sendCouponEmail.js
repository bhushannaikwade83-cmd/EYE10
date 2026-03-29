import { COUPON_EXPIRY_DAYS } from './googleReviews'

function envTrim(key) {
  return String(import.meta.env[key] ?? '').trim()
}

/** Which Brevo-related env vars are empty (for user-facing hints; never log values). */
export function getMissingCouponEmailEnvVars() {
  const missing = []
  if (!envTrim('VITE_BREVO_API_KEY')) missing.push('VITE_BREVO_API_KEY')
  if (!envTrim('VITE_BREVO_SENDER_EMAIL')) missing.push('VITE_BREVO_SENDER_EMAIL')
  return missing
}

export function isCouponEmailConfigured() {
  return getMissingCouponEmailEnvVars().length === 0
}

/**
 * Sends coupon details via Brevo Transactional Email API.
 * NOTE: Direct browser calls expose API keys. For production, move this to backend.
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

  const apiKey = envTrim('VITE_BREVO_API_KEY')
  const senderEmail = envTrim('VITE_BREVO_SENDER_EMAIL')
  const senderName = envTrim('VITE_BREVO_SENDER_NAME') || 'EYE10'
  const subjectPrefix = envTrim('VITE_BREVO_SUBJECT_PREFIX') || 'EYE10'

  try {
    const safeName = String(customerName || 'Customer')
    const safeCode = String(couponCode ?? '')
    const safeOffer = String(offerLabel ?? '')
    const safeDays = String(COUPON_EXPIRY_DAYS)
    const fromDate = validFrom ? new Date(validFrom) : new Date()
    const tillDate = validTill
      ? new Date(validTill)
      : new Date(fromDate.getTime() + COUPON_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    const safeFrom = Number.isNaN(fromDate.getTime()) ? 'N/A' : fromDate.toLocaleDateString('en-IN')
    const safeTill = Number.isNaN(tillDate.getTime()) ? 'N/A' : tillDate.toLocaleDateString('en-IN')
    const subject = `${subjectPrefix} Coupon Code: ${safeCode}`
    const textContent = [
      `Hi ${safeName},`,
      '',
      'Thanks for your Google review at EYE10.',
      '',
      `Your coupon code: ${safeCode}`,
      `Offer: ${safeOffer}`,
      `Valid from: ${safeFrom}`,
      `Valid till: ${safeTill}`,
      `Validity window: ${safeDays} days`,
      '',
      'Show this code at EYE10 shop to redeem.',
    ].join('\n')
    const htmlContent = `
      <p>Hi ${safeName},</p>
      <p>Thanks for your Google review at <strong>EYE10</strong>.</p>
      <p>
        <strong>Your coupon code:</strong> ${safeCode}<br/>
        <strong>Offer:</strong> ${safeOffer}<br/>
        <strong>Valid from:</strong> ${safeFrom}<br/>
        <strong>Valid till:</strong> ${safeTill}<br/>
        <strong>Validity window:</strong> ${safeDays} days
      </p>
      <p>Show this code at EYE10 shop to redeem.</p>
    `

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email, name: safeName }],
        subject,
        textContent,
        htmlContent,
      }),
    })

    if (!response.ok) {
      let detail = await response.text()
      try {
        const parsed = JSON.parse(detail)
        detail = parsed?.message || parsed?.code || detail
      } catch (_) {
        // keep raw detail
      }
      return { ok: false, detail: `(${response.status}) ${detail}` }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: err, detail: err?.message || 'Network error' }
  }
}
