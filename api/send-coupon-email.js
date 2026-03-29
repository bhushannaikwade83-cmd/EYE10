function envTrim(key) {
  return String(process.env[key] ?? '').trim()
}

async function readJsonBody(req) {
  if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}')
    } catch {
      return {}
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf8') || '{}')
    } catch {
      return {}
    }
  }
  try {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString('utf8')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = envTrim('BREVO_API_KEY')
  const senderEmail = envTrim('BREVO_SENDER_EMAIL')
  const senderName = envTrim('BREVO_SENDER_NAME') || 'EYE10'
  const subjectPrefix = envTrim('BREVO_SUBJECT_PREFIX') || 'EYE10'

  if (!apiKey || !senderEmail) {
    return res.status(503).json({
      error: 'Email service is not configured',
      missing: [
        ...(!apiKey ? ['BREVO_API_KEY'] : []),
        ...(!senderEmail ? ['BREVO_SENDER_EMAIL'] : []),
      ],
    })
  }

  try {
    const body = await readJsonBody(req)
    const email = String(body.customerEmail || '').trim()
    if (!email) return res.status(400).json({ error: 'Missing customerEmail' })

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
      }),
    })

    if (!response.ok) {
      let detail = await response.text()
      try {
        const parsed = JSON.parse(detail)
        detail = parsed?.message || parsed?.code || detail
      } catch {
        // keep raw detail
      }
      return res.status(response.status).json({ error: detail || 'Brevo send failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Server error' })
  }
}

