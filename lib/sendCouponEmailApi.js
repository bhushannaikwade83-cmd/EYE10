function envTrim(key) {
  return String(process.env[key] ?? '').trim()
}

function toSafeDateLabel(value) {
  if (!value) return 'N/A'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return 'N/A'
    return d.toLocaleDateString('en-IN')
  } catch {
    return 'N/A'
  }
}

/**
 * Shared coupon email handler (Vercel serverless + Vite dev middleware).
 * @param {Record<string, unknown>} body
 * @returns {Promise<{ status: number, json: Record<string, unknown> }>}
 */
export async function handleSendCouponEmail(body) {
  // Prefer server-only names; fall back to legacy VITE_* if those are all that exist in the dashboard.
  const apiKey = envTrim('BREVO_API_KEY') || envTrim('VITE_BREVO_API_KEY')
  const senderEmail = envTrim('BREVO_SENDER_EMAIL') || envTrim('VITE_BREVO_SENDER_EMAIL')
  const senderName =
    envTrim('BREVO_SENDER_NAME') || envTrim('VITE_BREVO_SENDER_NAME') || 'EYE10'
  const subjectPrefix =
    envTrim('BREVO_SUBJECT_PREFIX') || envTrim('VITE_BREVO_SUBJECT_PREFIX') || 'EYE10'

  if (!apiKey || !senderEmail) {
    return {
      status: 503,
      json: {
        error: 'Email service is not configured',
        missing: [
          ...(!apiKey ? ['BREVO_API_KEY (or VITE_BREVO_API_KEY)'] : []),
          ...(!senderEmail ? ['BREVO_SENDER_EMAIL (or VITE_BREVO_SENDER_EMAIL)'] : []),
        ],
      },
    }
  }

  try {
    const email = String(body.customerEmail || '').trim()
    if (!email) {
      return { status: 400, json: { error: 'Missing customerEmail' } }
    }

    const safeName = String(body.customerName || 'Customer').trim() || 'Customer'
    const safeCode = String(body.couponCode || '').trim()
    const safeOffer = String(body.offerLabel || '').trim()
    const safeDays = String(body.validityDays || 30)
    const safeFrom = toSafeDateLabel(body.validFrom)
    const safeTill = toSafeDateLabel(body.validTill)

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
        tags: ['coupon', 'google-review'],
      }),
    })

    const raw = await response.text()
    let parsed = {}
    try {
      parsed = raw ? JSON.parse(raw) : {}
    } catch {
      // non-JSON error body
    }

    if (!response.ok) {
      let detail = parsed?.message || parsed?.code || raw || 'Brevo send failed'
      return { status: response.status, json: { error: detail } }
    }

    return {
      status: 200,
      json: {
        ok: true,
        messageId: parsed.messageId ?? null,
      },
    }
  } catch (e) {
    return { status: 500, json: { error: e?.message || 'Server error' } }
  }
}
