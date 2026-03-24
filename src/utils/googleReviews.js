const WEBSITE_REVIEWS_KEY = 'websiteGoogleStyleReviews'
const WEBSITE_COUPONS_KEY = 'websiteReviewCoupons'
export const WEBSITE_REVIEWS_UPDATED_EVENT = 'websiteReviewsUpdated'
export const WEBSITE_COUPONS_UPDATED_EVENT = 'websiteCouponsUpdated'
export const COUPON_EXPIRY_DAYS = 7

export const GOOGLE_REVIEW_URL =
  import.meta.env.VITE_GOOGLE_REVIEW_URL ||
  'https://maps.app.goo.gl/vS9y8nECv9gTCuAE6'

export const REVIEW_OPTIONS = [
  'Friendly staff',
  'Clear eye testing',
  'Good frame collection',
  'Affordable pricing',
  'Fast service',
  'Helpful consultation',
  'Comfortable fit',
  'Good after-sales support',
]

export const getWebsiteReviews = () => {
  try {
    const data = localStorage.getItem(WEBSITE_REVIEWS_KEY)
    return data ? JSON.parse(data) : []
  } catch (_) {
    return []
  }
}

export const saveWebsiteReview = (review) => {
  try {
    const existing = getWebsiteReviews()
    const next = [review, ...existing].slice(0, 20)
    localStorage.setItem(WEBSITE_REVIEWS_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(WEBSITE_REVIEWS_UPDATED_EVENT))
    return next
  } catch (_) {
    return getWebsiteReviews()
  }
}

export const buildReviewSentence = (selectedOptions, rating) => {
  const clean = selectedOptions.filter(Boolean)
  const lead =
    rating >= 5
      ? 'Excellent experience at EYE10.'
      : rating >= 4
      ? 'Very good experience at EYE10.'
      : 'Good experience at EYE10.'

  if (clean.length === 0) {
    return `${lead} I am satisfied with the overall service.`
  }

  if (clean.length === 1) {
    return `${lead} ${clean[0]} stood out for me.`
  }

  if (clean.length === 2) {
    return `${lead} I liked the ${clean[0].toLowerCase()} and ${clean[1].toLowerCase()}.`
  }

  const first = clean.slice(0, clean.length - 1).join(', ').toLowerCase()
  const last = clean[clean.length - 1].toLowerCase()
  return `${lead} I liked the ${first}, and ${last}.`
}

export const getWebsiteCoupons = () => {
  try {
    const data = localStorage.getItem(WEBSITE_COUPONS_KEY)
    return data ? JSON.parse(data) : []
  } catch (_) {
    return []
  }
}

const saveWebsiteCoupons = (coupons) => {
  try {
    localStorage.setItem(WEBSITE_COUPONS_KEY, JSON.stringify(coupons))
    window.dispatchEvent(new Event(WEBSITE_COUPONS_UPDATED_EVENT))
    return coupons
  } catch (_) {
    return getWebsiteCoupons()
  }
}

export const normalizePhoneNumber = (input) => {
  const digits = String(input || '').replace(/\D/g, '')
  if (digits.length >= 10) return digits.slice(-10)
  return digits
}

const buildCouponCode = (couponValue, name, phone) => {
  const safeName = (name.trim() || 'CUSTOMER')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase()
  const phoneTail = normalizePhoneNumber(phone).slice(-4) || '0000'
  const token = String(Date.now()).slice(-4)
  return `EYE${couponValue}${safeName}${phoneTail}${token}`
}

export const issueCouponForReview = ({ name, phone, couponLabel, couponValue }) => {
  const normalizedPhone = normalizePhoneNumber(phone)
  if (normalizedPhone.length !== 10) {
    return { ok: false, reason: 'invalid-phone' }
  }

  const existing = getWebsiteCoupons()
  const alreadyIssued = existing.find((coupon) => coupon.phone === normalizedPhone)
  if (alreadyIssued) {
    return { ok: false, reason: 'already-issued', coupon: alreadyIssued }
  }

  const issuedAt = new Date()
  const expiresAt = new Date(issuedAt.getTime() + COUPON_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  const coupon = {
    id: Date.now(),
    name: name.trim() || 'Customer',
    phone: normalizedPhone,
    code: buildCouponCode(couponValue, name, normalizedPhone),
    offerLabel: couponLabel,
    offerValue: couponValue,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    redeemedAt: null,
  }

  saveWebsiteCoupons([coupon, ...existing].slice(0, 500))
  return { ok: true, coupon }
}

export const getCouponByCode = (code) => {
  const coupons = getWebsiteCoupons()
  const cleanCode = String(code || '').trim().toUpperCase()
  return coupons.find((item) => String(item.code || '').toUpperCase() === cleanCode) || null
}

export const getCouponStatus = (coupon) => {
  if (!coupon) return 'not-found'
  if (coupon.redeemedAt) return 'redeemed'
  const now = Date.now()
  const expiry = new Date(coupon.expiresAt).getTime()
  if (Number.isFinite(expiry) && now > expiry) return 'expired'
  return 'valid'
}

export const redeemCoupon = (code) => {
  const coupons = getWebsiteCoupons()
  const cleanCode = String(code || '').trim().toUpperCase()
  const index = coupons.findIndex(
    (item) => String(item.code || '').toUpperCase() === cleanCode
  )
  if (index < 0) return { ok: false, reason: 'not-found' }

  const coupon = coupons[index]
  const status = getCouponStatus(coupon)
  if (status !== 'valid') {
    return { ok: false, reason: status, coupon }
  }

  const updatedCoupon = {
    ...coupon,
    redeemedAt: new Date().toISOString(),
  }
  const next = [...coupons]
  next[index] = updatedCoupon
  saveWebsiteCoupons(next)
  return { ok: true, coupon: updatedCoupon }
}
