import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './HomeOffersSlider.css'

const AUTO_MS = 6000

/**
 * @param {{ homeBanners?: Array<{ id: string, mediaUrl?: string, mediaType?: string, title?: string, linkUrl?: string }> }} props
 */
function HomeOffersSlider({ homeBanners = [] }) {
  const slides = (homeBanners || []).filter((b) => (b.mediaUrl || '').trim())
  const slideKey = slides.map((s) => s.id).join(',')
  const [index, setIndex] = useState(0)

  const len = slides.length
  const go = useCallback(
    (dir) => {
      if (len === 0) return
      setIndex((i) => (i + dir + len) % len)
    },
    [len]
  )

  useEffect(() => {
    setIndex(0)
  }, [len, slideKey])

  useEffect(() => {
    if (len <= 1) return undefined
    const t = window.setInterval(() => go(1), AUTO_MS)
    return () => window.clearInterval(t)
  }, [len, go])

  if (len === 0) return null

  const current = slides[index]
  const isVideo = current.mediaType === 'video'

  const inner = (
    <>
      {isVideo ? (
        <video
          className="home-offers-slider__media"
          src={current.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          poster=""
        />
      ) : (
        <img
          className="home-offers-slider__media"
          src={current.mediaUrl}
          alt={current.title || 'Offer'}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      )}
      {current.title ? <p className="home-offers-slider__caption">{current.title}</p> : null}
    </>
  )

  return (
    <section className="home-offers-slider" aria-labelledby="home-offers-heading">
      <h2 id="home-offers-heading" className="visually-hidden">
        Offers and promotions
      </h2>
      <div className="home-offers-slider__viewport">
        {current.linkUrl ? (
          <a
            href={current.linkUrl}
            className="home-offers-slider__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {inner}
          </a>
        ) : (
          <div className="home-offers-slider__link home-offers-slider__link--static">{inner}</div>
        )}

        {len > 1 ? (
          <>
            <button
              type="button"
              className="home-offers-slider__nav home-offers-slider__nav--prev"
              aria-label="Previous slide"
              onClick={() => go(-1)}
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              className="home-offers-slider__nav home-offers-slider__nav--next"
              aria-label="Next slide"
              onClick={() => go(1)}
            >
              <ChevronRight size={28} />
            </button>
            <div className="home-offers-slider__dots" role="tablist" aria-label="Slide selection">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}`}
                  className={`home-offers-slider__dot ${i === index ? 'active' : ''}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default HomeOffersSlider
