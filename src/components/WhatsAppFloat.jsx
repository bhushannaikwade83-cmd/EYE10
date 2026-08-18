import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { getSiteWhatsAppDigits } from '../utils/siteContact'
import { useSiteContent } from '../context/SiteContentContext'
import './WhatsAppFloat.css'

/** Visible on the home page for the whole scroll, not just near the top. */
function WhatsAppFloat() {
  const { pathname } = useLocation()
  const { content } = useSiteContent()
  const whatsappUrl = buildWhatsAppUrl(getSiteWhatsAppDigits(content))
  const [isVisible, setIsVisible] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const btnRef = useRef(null)

  useEffect(() => {
    if (pathname !== '/') {
      setIsVisible(false)
      return
    }

    setIsVisible(true)

    // Keeps its usual bottom-corner spot, but steps below the hero's
    // floating eyewear cutouts on short viewports where they'd otherwise
    // overlap (the cutouts are horizontally centered, so on narrow screens
    // they can reach close enough to the corner to collide).
    const avoidHeroOverlap = () => {
      const btn = btnRef.current
      const images = document.querySelectorAll('.hero-float-img')
      if (!btn || images.length === 0) return

      const wasShifted = btn.style.top !== ''
      if (wasShifted) {
        btn.style.top = ''
        btn.style.bottom = ''
      }

      const btnRect = btn.getBoundingClientRect()
      let overlaps = false
      let imagesBottom = 0
      images.forEach((img) => {
        const imgRect = img.getBoundingClientRect()
        imagesBottom = Math.max(imagesBottom, imgRect.bottom)
        if (
          !(
            btnRect.right < imgRect.left ||
            btnRect.left > imgRect.right ||
            btnRect.bottom < imgRect.top ||
            btnRect.top > imgRect.bottom
          )
        ) {
          overlaps = true
        }
      })

      if (!overlaps) {
        setBlocked(false)
        return
      }

      const maxTop = window.innerHeight - btnRect.height - 16
      const desiredTop = imagesBottom + 16
      // No room below the images on this viewport even after clamping —
      // rather than show it overlapping or off-screen, hide it here.
      if (desiredTop > maxTop) {
        setBlocked(true)
        return
      }

      setBlocked(false)
      const shiftedTop = `${desiredTop}px`
      if (btn.style.top !== shiftedTop) {
        btn.style.top = shiftedTop
        btn.style.bottom = 'auto'
      }
    }

    avoidHeroOverlap()

    window.addEventListener('scroll', avoidHeroOverlap, { passive: true })
    window.addEventListener('resize', avoidHeroOverlap)

    return () => {
      window.removeEventListener('scroll', avoidHeroOverlap)
      window.removeEventListener('resize', avoidHeroOverlap)
    }
  }, [pathname])

  if (pathname !== '/' || !whatsappUrl) return null

  return (
    <a
      ref={btnRef}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`whatsapp-float ${isVisible && !blocked ? 'visible' : ''}`}
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="whatsapp-float-icon" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.674 4.523 1.84 6.367L4 29l7.83-1.812A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm6.988 16.86c-.296.833-1.47 1.53-2.406 1.73-.64.135-1.474.243-4.29-.918-3.6-1.484-5.917-5.14-6.098-5.377-.174-.238-1.468-1.954-1.468-3.728 0-1.774.93-2.646 1.26-3.008.33-.362.72-.452.96-.452.24 0 .48.002.69.013.222.011.518-.084.81.618.296.712.998 2.454 1.086 2.633.09.18.15.39.03.628-.12.238-.18.386-.36.594-.18.208-.378.462-.54.62-.18.177-.367.37-.157.727.21.357.933 1.54 2.004 2.494 1.377 1.228 2.538 1.61 2.895 1.79.357.18.567.15.777-.09.21-.24.9-1.048 1.14-1.408.24-.36.48-.298.81-.18.33.12 2.1.99 2.46 1.17.36.18.6.27.69.42.09.15.09.868-.207 1.7Z"/>
      </svg>
    </a>
  )
}

export default WhatsAppFloat
