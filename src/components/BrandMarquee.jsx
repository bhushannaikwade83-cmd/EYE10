import { useMemo } from 'react'
import { useSiteContent } from '../context/SiteContentContext'
import { getCatalogueItems } from '../utils/catalogue'
import { getBrandFontStyle } from '../utils/brandFonts'
import './BrandMarquee.css'

// Shown before any catalogues exist yet, so the section isn't empty on a fresh install.
const PLACEHOLDER_NAMES = [
  'Titan', 'Fossil', 'Casio', 'Fastrack', 'Ray-Ban', 'Oakley', 'Gucci', 'Prada', 'Versace',
]

function BrandMarquee() {
  const { content } = useSiteContent()

  // Live from Admin → Catalogues, same source as the Brands grid below — add a
  // catalogue for a new brand there and it appears here automatically, with a
  // font auto-assigned to it (see getBrandFontStyle) the moment it renders.
  const names = useMemo(() => {
    const fromCatalogue = getCatalogueItems(content)
      .map((x) => String(x.brandName || '').trim())
      .filter(Boolean)
    const unique = Array.from(new Set(fromCatalogue))
    return unique.length > 0 ? unique : PLACEHOLDER_NAMES
  }, [content])

  const items = [...names, ...names]

  return (
    <section className="brand-marquee" aria-label="Brands we offer">
      <div className="brand-marquee-track">
        {items.map((name, index) => (
          <span key={`${name}-${index}`} className="brand-marquee-item" style={getBrandFontStyle(name)}>
            {name}
          </span>
        ))}
      </div>
    </section>
  )
}

export default BrandMarquee
