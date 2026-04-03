import { useCallback, useEffect, useRef, useState } from 'react'
import './IntroReveal.css'
import logoImage from '../assets/eye10-logo.png'

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

    /** Any vertical scroll (down or up) dismisses — matches “scroll to continue”. */
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) >= 4 || Math.abs(e.deltaX) >= 4) dismiss()
    }

    const onTouchStart = (e) => {
      touchStartY.current = e.touches?.[0]?.clientY ?? null
    }

    const onTouchMove = (e) => {
      const start = touchStartY.current
      const now = e.touches?.[0]?.clientY ?? null
      if (start == null || now == null) return
      if (Math.abs(now - start) > 24) dismiss()
    }

    const onKeyDown = (e) => {
      if (
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'PageDown' ||
        e.key === 'PageUp' ||
        e.key === ' ' ||
        e.key === 'Escape' ||
        e.key === 'Enter'
      ) {
        if (e.key === ' ') e.preventDefault()
        dismiss()
      }
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
        <div className="intro-logo-wrap" aria-hidden="true">
          <img src={logoImage} alt="" className="intro-logo-img" />
        </div>
        <p className="intro-copy">Scroll to continue</p>
        <button type="button" className="intro-skip" onClick={dismiss}>
          Skip intro
        </button>
      </div>
    </div>
  )
}
