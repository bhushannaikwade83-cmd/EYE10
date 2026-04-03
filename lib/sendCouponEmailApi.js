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

const EMAILJS_SEND_URL = 'https://api.emailjs.com/api/v1.0/email/send'

/**
 * Shared coupon email handler (Vite dev middleware + Vercel serverless).
 * Uses EmailJS REST API: https://www.emailjs.com/docs/rest-api/send/
 *
 * In the EmailJS template, set "To Email" to {{to_email}} (or map params to your field names).
 * @param {Record<string, unknown>} body
 * @returns {Promise<{ status: number, json: Record<string, unknown> }>}
 */
export async function handleSendCouponEmail(body) {
  const publicKey =
    envTrim('EMAILJS_PUBLIC_KEY') || envTrim('VITE_EMAILJS_PUBLIC_KEY')
  const serviceId =
    envTrim('EMAILJS_SERVICE_ID') || envTrim('VITE_EMAILJS_SERVICE_ID')
  const templateId =
    envTrim('EMAILJS_TEMPLATE_ID') || envTrim('VITE_EMAILJS_TEMPLATE_ID')
  const subjectPrefix =
    envTrim('EMAILJS_SUBJECT_PREFIX') ||
    envTrim('VITE_EMAILJS_SUBJECT_PREFIX') ||
    'EYE10'

  if (!publicKey || !serviceId || !templateId) {
    return {
      status: 503,
      json: {
        error: 'Email service is not configured',
        missing: [
          ...(!publicKey ? ['EMAILJS_PUBLIC_KEY (or VITE_EMAILJS_PUBLIC_KEY)'] : []),
          ...(!serviceId ? ['EMAILJS_SERVICE_ID (or VITE_EMAILJS_SERVICE_ID)'] : []),
          ...(!templateId ? ['EMAILJS_TEMPLATE_ID (or VITE_EMAILJS_TEMPLATE_ID)'] : []),
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
    const subjectLine = `${subjectPrefix} Coupon Code: ${safeCode}`

    const plainLines = [
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
    ]

    const response = await fetch(EMAILJS_SEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: email,
          to_name: safeName,
          customer_name: safeName,
          customer_email: email,
          coupon_code: safeCode,
          offer_label: safeOffer,
          valid_from: safeFrom,
          valid_till: safeTill,
          validity_days: safeDays,
          subject_line: subjectLine,
          message_text: plainLines.join('\n'),
        },
      }),
    })

    const raw = await response.text()
    if (!response.ok) {
      let detail = raw || 'EmailJS send failed'
      try {
        const parsed = raw ? JSON.parse(raw) : {}
        detail = parsed.text || parsed.message || detail
      } catch {
        // plain-text error body
      }
      const status = response.status >= 400 ? response.status : 502
      return { status, json: { error: String(detail).slice(0, 500) } }
    }

    return {
      status: 200,
      json: {
        ok: true,
        messageId: raw?.trim() || null,
      },
    }
  } catch (e) {
    return { status: 500, json: { error: e?.message || 'Server error' } }
  }
}
