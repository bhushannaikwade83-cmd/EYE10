import { useCallback, useEffect, useRef, useState } from 'react'
import './IntroReveal.css'
import logo from '../assets/eye10-logo.svg'

export default function IntroReveal({ enabled }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const touchStartY = useRef(null)
  const dismiss = useCallback(() => {
    if (leaving) return
    setLeaving(true)
    window.setTimeout(() => {
      setVisible(false)
      document.body.classList.remove('intro-lock')
    }, 850)
  }, [leaving])

  useEffect(() => {
    if (enabled) {
      setVisible(true)
      document.body.classList.add('intro-lock')
    } else {
      setVisible(false)
      setLeaving(false)
      document.body.classList.remove('intro-lock')
    }
    return () => {
      document.body.classList.remove('intro-lock')
    }
  }, [enabled])

  useEffect(() => {
    if (!visible) return

    const onWheel = (e) => {
      if (e.deltaY < -8) dismiss()
    }

    const onTouchStart = (e) => {
      touchStartY.current = e.touches?.[0]?.clientY ?? null
    }

    const onTouchMove = (e) => {
      const start = touchStartY.current
      const now = e.touches?.[0]?.clientY ?? null
      if (start == null || now == null) return
      const delta = now - start
      if (delta > 26) dismiss()
    }

    const onKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'PageUp') dismiss()
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [visible, dismiss])

  if (!visible) return null

  return (
    <div className={`intro-reveal ${leaving ? 'is-leaving' : ''}`} aria-live="polite">
      <div className="intro-bg" />
      <div className="intro-content">
        <div className="intro-logo-stack" aria-hidden="true">
          <img src={logo} alt="" className="intro-logo-layer layer-back" />
          <img src={logo} alt="" className="intro-logo-layer layer-mid" />
          <img src={logo} alt="" className="intro-logo-layer layer-front" />
        </div>
        <p className="intro-copy">Scroll up to open website</p>
        <button type="button" className="intro-skip" onClick={dismiss}>
          Skip intro
        </button>
      </div>
    </div>
  )
}
