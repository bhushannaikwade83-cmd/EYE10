import { useEffect, useMemo, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  COUPON_EXPIRY_DAYS,
  REVIEW_OPTIONS,
  GOOGLE_REVIEW_URL,
  buildReviewSentence,
  getCouponByCode,
  getWebsiteReviews,
  issueCouponForReview,
  saveWebsiteReview,
} from '../utils/googleReviews'
import { getLastInquiryContact } from '../utils/inquiryContact'
import {
  sendCouponEmail,
} from '../utils/sendCouponEmail'
import './GoogleReviewAssistant.css'

function GoogleReviewAssistant() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(5)
  const [selected, setSelected] = useState([])
  const [websiteReviews, setWebsiteReviews] = useState([])
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponValue, setCouponValue] = useState('')
  const [wheelRotation, setWheelRotation] = useState(0)

  const nameRef = useRef('')
  const emailRef = useRef('')
  const emailInputRef = useRef(null)
  useEffect(() => {
    nameRef.current = name
  }, [name])
  useEffect(() => {
    emailRef.current = email
  }, [email])

  /** DOM value first — browser autofill can fill the field before React state/refs update. */
  const getEmailForCoupon = () =>
    String(emailInputRef.current?.value ?? emailRef.current ?? '').trim()

  const couponOptions = useMemo(
    () => [
      { label: '5% OFF', value: 5 },
      { label: '10% OFF', value: 10 },
      { label: '15% OFF', value: 15 },
      { label: '20% OFF', value: 20 },
      { label: 'Free Lens Cleaning Kit', value: 'KIT' },
      { label: 'Flat Rs. 300 OFF', value: '300' },
    ],
    []
  )

  useEffect(() => {
    setWebsiteReviews(getWebsiteReviews())
  }, [])

  useEffect(() => {
    const applySavedInquiry = () => {
      const saved = getLastInquiryContact()
      if (!saved) return
      setPhone((prev) => (prev.trim() ? prev : saved.phone))
      setName((prev) => (prev.trim() ? prev : saved.name))
      setEmail((prev) => (prev.trim() ? prev : saved.email || ''))
    }
    applySavedInquiry()
    window.addEventListener('eye10InquiryContactUpdated', applySavedInquiry)
    return () => window.removeEventListener('eye10InquiryContactUpdated', applySavedInquiry)
  }, [])

  const generatedText = useMemo(
    () => buildReviewSentence(selected, rating),
    [selected, rating]
  )

  const segmentAngle = 360 / couponOptions.length

  const couponWheelDiskStyle = useMemo(() => {
    const colors = ['#e0f2fe', '#fae8ff']
    const gradients = couponOptions
      .map((_, index) => {
        const start = index * segmentAngle
        const end = (index + 1) * segmentAngle
        return `${colors[index % colors.length]} ${start}deg ${end}deg`
      })
      .join(', ')

    return {
      background: `conic-gradient(${gradients})`,
    }
  }, [couponOptions, segmentAngle])

  const couponWheelSpinStyle = useMemo(
    () => ({
      transform: `rotate(${wheelRotation}deg)`,
    }),
    [wheelRotation]
  )

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const review = {
      id: Date.now(),
      name: name.trim() || 'Customer',
      rating,
      text: generatedText,
      createdAt: new Date().toISOString(),
    }

    setWebsiteReviews(saveWebsiteReview(review))

    try {
      await navigator.clipboard.writeText(generatedText)
      toast.success('Review text generated and copied!')
    } catch (_) {
      toast.success('Review text generated!')
    }

    if (GOOGLE_REVIEW_URL) {
      window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer')
    } else {
      toast('Review page is not available right now. Please try again later.')
    }

    setReviewSubmitted(true)
    setCouponCode('')
    setCouponValue('')
  }

  const trySendCouponEmail = async (code, offer, validity = {}) => {
    if (!getEmailForCoupon()) {
      toast.error('Enter a valid email above before spinning.')
      return
    }
    const couponMeta = getCouponByCode(code)
    const validFrom = validity.validFrom || couponMeta?.issuedAt
    const validTill = validity.validTill || couponMeta?.expiresAt
    const result = await sendCouponEmail({
      customerName: nameRef.current.trim() || 'Customer',
      customerEmail: getEmailForCoupon(),
      couponCode: code,
      offerLabel: offer,
      validFrom,
      validTill,
    })
    if (result.ok) {
      toast.success(
        'Coupon sent. If your inbox is empty in a few minutes, check Spam or Promotions.',
        { duration: 6000 }
      )
      return
    }
    if (result.skipped && result.reason === 'not-configured') {
      toast.error(
        result.detail || 'Email delivery is currently unavailable. Please try again later.'
      )
      return
    }
    if (result.skipped && result.reason === 'no-email') {
      toast.error('Enter a valid email above before spinning.')
      return
    }
    const hint = result.detail ? ` ${result.detail}` : ''
    toast.error(`Could not send email.${hint}`)
  }

  const spinCouponWheel = () => {
    if (isSpinning || !reviewSubmitted) return

    const winningIndex = Math.floor(Math.random() * couponOptions.length)
    const selectedCoupon = couponOptions[winningIndex]
    const segmentAngle = 360 / couponOptions.length
    const stopAt = 360 - winningIndex * segmentAngle - segmentAngle / 2
    const turns = 5 * 360
    const nextRotation = turns + stopAt
    setIsSpinning(true)
    setWheelRotation((prev) => prev + nextRotation)

    window.setTimeout(() => {
      const result = issueCouponForReview({
        name,
        phone,
        couponLabel: selectedCoupon.label,
        couponValue: selectedCoupon.value,
      })
      setIsSpinning(false)

      if (!result.ok && result.reason === 'already-issued' && result.coupon) {
        setCouponValue(result.coupon.offerLabel)
        setCouponCode(result.coupon.code)
        toast.error('Only one coupon is allowed per mobile number.')
        void trySendCouponEmail(result.coupon.code, result.coupon.offerLabel, {
          validFrom: result.coupon.issuedAt,
          validTill: result.coupon.expiresAt,
        })
        return
      }

      if (!result.ok) {
        toast.error('Unable to issue coupon. Please check your mobile number.')
        return
      }

      setCouponValue(result.coupon.offerLabel)
      setCouponCode(result.coupon.code)
      toast.success(`You won ${selectedCoupon.label}!`)
      void trySendCouponEmail(result.coupon.code, result.coupon.offerLabel, {
        validFrom: result.coupon.issuedAt,
        validTill: result.coupon.expiresAt,
      })
    }, 3200)
  }

  const resetFlow = () => {
    setRating(5)
    setName('')
    setPhone('')
    setEmail('')
    setSelected([])
    setReviewSubmitted(false)
    setIsSpinning(false)
    setCouponCode('')
    setCouponValue('')
    setWheelRotation(0)
  }

  return (
    <section className="google-review-section">
      <div className="container">
        <div className="google-review-header">
          <h2>Google Review and Spin Coupon</h2>
          <p>
            Review on Google, come back, spin the wheel—we email your coupon to the address you
            enter below.
          </p>
        </div>

        <form className="google-review-form" onSubmit={handleSubmit}>
          <div className="review-row">
            <label htmlFor="review-name">Your Name</label>
            <input
              id="review-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="review-row">
            <label htmlFor="review-phone">Mobile number (same as enquiry)</label>
            <input
              id="review-phone"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Filled from Enquire Now, or enter 10-digit number"
              required
            />
            <p className="review-hint">
              Used to issue one coupon per customer. Same number as <strong>Enquire Now</strong> if
              possible.
            </p>
          </div>

          <div className="review-row">
            <label htmlFor="review-email">Email (for coupon)</label>
            <input
              ref={emailInputRef}
              id="review-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Filled from Enquire Now, or enter your email"
              required
            />
            <p className="review-hint">
              Same email as enquiry if possible—we send your coupon code here after you spin.
            </p>
          </div>

          <div className="review-row">
            <label>Rating</label>
            <div className="review-stars" role="radiogroup" aria-label="Select rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`review-star-btn ${rating >= value ? 'active' : ''}`}
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value > 1 ? 's' : ''}`}
                >
                  <Star size={20} fill={rating >= value ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="review-star-text">{rating}/5</span>
            </div>
          </div>

          <div className="review-options">
            {REVIEW_OPTIONS.map((option) => (
              <label key={option} className="review-option">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <div className="generated-preview">
            <strong>Generated review:</strong>
            <p>{generatedText}</p>
          </div>

          <button type="submit" className="btn btn-primary">
            Submit Review and Open Google
          </button>
        </form>

        {reviewSubmitted && (
          <div className="coupon-flow-card">
            <h3>Step 2: After posting review, spin your coupon</h3>
            <p>
              Once your Google review is done, click spin and claim your offer.
            </p>

            <div className="coupon-wheel-wrap">
              <div className="coupon-wheel-pointer" aria-hidden>
                ▼
              </div>
              <div className="coupon-wheel" style={couponWheelSpinStyle}>
                <div className="coupon-wheel-disk" style={couponWheelDiskStyle} aria-hidden />
                {couponOptions.map((option, index) => (
                  <span
                    key={option.label}
                    className="coupon-wheel-label"
                    style={{
                      '--label-angle': `${index * segmentAngle}deg`,
                      transform: `translate(-50%, -50%) rotate(${index * segmentAngle}deg) translateY(calc(-1 * var(--wheel-label-offset)))`,
                    }}
                  >
                    <span className="coupon-wheel-label-text">{option.label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="coupon-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={spinCouponWheel}
                disabled={isSpinning}
              >
                {isSpinning ? 'Spinning...' : 'Spin Coupon Wheel'}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetFlow}>
                Reset
              </button>
            </div>

            {couponCode && (
              <div className="coupon-result">
                <strong>Your Coupon Code: {couponCode}</strong>
                <p>
                  {couponValue} - Check your email inbox. Valid for {COUPON_EXPIRY_DAYS} days. Show
                  the code at the shop counter.
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    void trySendCouponEmail(couponCode, couponValue)
                  }
                >
                  Resend email
                </button>
              </div>
            )}
          </div>
        )}

        <div className="website-reviews">
          <h3>Latest Reviews On Website</h3>
          {websiteReviews.length === 0 ? (
            <p>No reviews submitted yet.</p>
          ) : (
            <div className="website-reviews-list">
              {websiteReviews.slice(0, 6).map((review) => (
                <article key={review.id} className="website-review-card">
                  <div className="website-review-top">
                    <strong>{review.name}</strong>
                    <span>{'★'.repeat(review.rating || 5)}</span>
                  </div>
                  <p>{review.text}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default GoogleReviewAssistant
