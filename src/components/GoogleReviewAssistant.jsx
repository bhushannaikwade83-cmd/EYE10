import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

const SCRATCH_BRUSH_PX = 38
const SCRATCH_REVEAL_RATIO = 0.26

function CouponScratchCard({ phase, revealed, onRevealed, couponCode, couponValue }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const revealedRef = useRef(false)
  const rafRef = useRef(0)

  useEffect(() => {
    revealedRef.current = revealed
  }, [revealed])

  const paintScratchLayer = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    if (w < 16 || h < 16) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#e8dcc8')
    g.addColorStop(0.45, '#bca67e')
    g.addColorStop(1, '#d2c4a8')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgb(255 255 255 / 0.14)'
    for (let i = 0; i < 64; i++) {
      ctx.fillRect((i * 17) % w, (i * 31) % h, 2, 2)
    }
    ctx.strokeStyle = 'rgb(255 255 255 / 0.35)'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
    ctx.font = '600 14px Montserrat, Poppins, system-ui, sans-serif'
    ctx.fillStyle = 'rgb(40 35 30 / 0.55)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Scratch here', w / 2, h / 2 - 10)
    ctx.font = '500 12px Poppins, system-ui, sans-serif'
    ctx.fillText('to reveal your offer', w / 2, h / 2 + 12)
  }, [])

  const measureScratchProgress = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    const { width, height } = canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const d = imageData.data
    let hit = 0
    let samples = 0
    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const i = (y * width + x) * 4 + 3
        samples++
        if (d[i] < 72) hit++
      }
    }
    return samples ? hit / samples : 0
  }, [])

  const maybeCompleteScratch = useCallback(() => {
    if (revealedRef.current) return
    if (measureScratchProgress() >= SCRATCH_REVEAL_RATIO) {
      onRevealed()
    }
  }, [measureScratchProgress, onRevealed])

  const eraseAt = useCallback(
    (clientX, clientY, fromPoint = null) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const sx = (clientX - rect.left) * scaleX
      const sy = (clientY - rect.top) * scaleY
      const strokeWidth = SCRATCH_BRUSH_PX * Math.max(scaleX, scaleY)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = strokeWidth
      if (fromPoint) {
        const fx = (fromPoint.x - rect.left) * scaleX
        const fy = (fromPoint.y - rect.top) * scaleY
        ctx.beginPath()
        ctx.moveTo(fx, fy)
        ctx.lineTo(sx, sy)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.arc(sx, sy, strokeWidth / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        maybeCompleteScratch()
      })
    },
    [maybeCompleteScratch]
  )

  const onPointerDown = (e) => {
    if (phase !== 'done' || revealed) return
    drawingRef.current = true
    lastPointRef.current = { x: e.clientX, y: e.clientY }
    eraseAt(e.clientX, e.clientY, null)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!drawingRef.current || phase !== 'done' || revealed) return
    eraseAt(e.clientX, e.clientY, lastPointRef.current)
    lastPointRef.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e) => {
    drawingRef.current = false
    lastPointRef.current = null
    maybeCompleteScratch()
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const onTouchStart = (e) => {
    const t = e.touches?.[0]
    if (!t || phase !== 'done' || revealed) return
    drawingRef.current = true
    lastPointRef.current = { x: t.clientX, y: t.clientY }
    eraseAt(t.clientX, t.clientY, null)
  }

  const onTouchMove = (e) => {
    const t = e.touches?.[0]
    if (!t || !drawingRef.current || phase !== 'done' || revealed) return
    eraseAt(t.clientX, t.clientY, lastPointRef.current)
    lastPointRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = () => {
    drawingRef.current = false
    lastPointRef.current = null
    maybeCompleteScratch()
  }

  useLayoutEffect(() => {
    if (phase !== 'done' || revealed) return
    const id = requestAnimationFrame(() => paintScratchLayer())
    return () => cancelAnimationFrame(id)
  }, [phase, revealed, paintScratchLayer])

  const revealAll = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
    onRevealed()
  }

  return (
    <div className="coupon-scratch-wrap">
      <div className="coupon-scratch-card" ref={wrapRef}>
        <div className="coupon-scratch-prize" aria-live="polite">
          {phase === 'error' ? (
            <div className="coupon-scratch-prize-inner coupon-scratch-prize-inner--error">
              We could not issue a coupon. Check your details and try again from Step 1.
            </div>
          ) : (
            <div className="coupon-scratch-prize-inner">
              <p className="coupon-scratch-brand">EYE10</p>
              <p className="coupon-scratch-offer">{couponValue || 'Your reward'}</p>
              {couponCode ? <p className="coupon-scratch-code">{couponCode}</p> : null}
              <p className="coupon-scratch-hint">Valid at the shop — see email for details</p>
            </div>
          )}
        </div>
        {phase === 'done' && !revealed ? (
          <canvas
            ref={canvasRef}
            className="coupon-scratch-canvas"
            role="img"
            aria-label="Scratch to reveal your coupon"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        ) : null}
      </div>
      {phase === 'done' && !revealed ? (
        <button type="button" className="btn btn-outline coupon-scratch-fallback" onClick={revealAll}>
          Can’t scratch? Tap to reveal
        </button>
      ) : null}
    </div>
  )
}

function GoogleReviewAssistant() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(5)
  const [selected, setSelected] = useState([])
  const [websiteReviews, setWebsiteReviews] = useState([])
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponValue, setCouponValue] = useState('')
  const [scratchKey, setScratchKey] = useState(0)
  const [scratchPhase, setScratchPhase] = useState('idle')
  const [scratchRevealed, setScratchRevealed] = useState(false)

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

  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    )
  }

  const trySendCouponEmail = async (code, offer, validity = {}) => {
    if (!getEmailForCoupon()) {
      toast.error('Enter a valid email above before revealing your coupon.')
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
      toast.error('Enter a valid email above before revealing your coupon.')
      return
    }
    const hint = result.detail ? ` ${result.detail}` : ''
    toast.error(`Could not send email.${hint}`)
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

    setCouponCode('')
    setCouponValue('')
    setScratchRevealed(false)

    const winningIndex = Math.floor(Math.random() * couponOptions.length)
    const selectedCoupon = couponOptions[winningIndex]
    const result = issueCouponForReview({
      name,
      phone,
      email: getEmailForCoupon(),
      couponLabel: selectedCoupon.label,
      couponValue: selectedCoupon.value,
    })

    if (!result.ok && result.reason === 'already-issued' && result.coupon) {
      setCouponValue(result.coupon.offerLabel)
      setCouponCode(result.coupon.code)
      toast.error('Only one coupon is allowed per customer.')
      setScratchPhase('done')
    } else if (!result.ok) {
      toast.error('Unable to issue coupon. Please check your details.')
      setScratchPhase('error')
    } else {
      setCouponValue(result.coupon.offerLabel)
      setCouponCode(result.coupon.code)
      toast.success(`You won ${selectedCoupon.label}!`)
      setScratchPhase('done')
    }

    setReviewSubmitted(true)
    setScratchKey((k) => k + 1)
  }

  const resetFlow = () => {
    setRating(5)
    setName('')
    setPhone('')
    setEmail('')
    setSelected([])
    setReviewSubmitted(false)
    setCouponCode('')
    setCouponValue('')
    setScratchPhase('idle')
    setScratchRevealed(false)
    setScratchKey(0)
  }

  const handleScratchRevealed = () => {
    if (scratchRevealed) return
    setScratchRevealed(true)
    if (couponCode && couponValue) {
      void trySendCouponEmail(couponCode, couponValue)
    }
  }

  return (
    <section className="google-review-section">
      <div className="container">
        <div className="google-review-header">
          <h2>Google Review and scratch coupon</h2>
          <p>
            Review on Google, then scratch the card below—we email your coupon to the address you
            enter here.
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
              Same email as enquiry if possible—we send your coupon code here after you scratch the card.
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
            <h3>Step 2: Scratch to reveal your coupon</h3>
            <p>
              After your Google review is posted, scratch the card with your finger or mouse to see
              your offer and code.
            </p>

            <CouponScratchCard
              key={scratchKey}
              phase={scratchPhase}
              revealed={scratchRevealed}
              onRevealed={handleScratchRevealed}
              couponCode={couponCode}
              couponValue={couponValue}
            />

            <div className="coupon-actions coupon-actions--scratch">
              <button type="button" className="btn btn-outline" onClick={resetFlow}>
                Start over
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
