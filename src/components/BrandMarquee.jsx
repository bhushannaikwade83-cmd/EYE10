import './BrandMarquee.css'

/**
 * Google Fonts stand-ins that echo each brand's real wordmark style
 * (actual brand typefaces are proprietary/licensed, not redistributable).
 */
const BRAND_STYLES = {
  TITAN: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontStyle: 'normal' },
  FOSSIL: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  CASIO: { fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  FASTRACK: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  'RAY-BAN': { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: 'italic' },
  OAKLEY: { fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontStyle: 'italic' },
  GUCCI: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: 'normal' },
  PRADA: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  VERSACE: { fontFamily: "'Playfair Display', serif", fontWeight: 800, fontStyle: 'normal' },
}

const BRAND_NAMES = Object.keys(BRAND_STYLES)

function BrandMarquee() {
  const items = [...BRAND_NAMES, ...BRAND_NAMES]

  return (
    <section className="brand-marquee" aria-label="Brands we offer">
      <div className="brand-marquee-track">
        {items.map((name, index) => (
          <span key={`${name}-${index}`} className="brand-marquee-item" style={BRAND_STYLES[name]}>
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}

export default BrandMarquee
