/**
 * Google Fonts stand-ins that echo each brand's real wordmark style
 * (actual brand typefaces are proprietary/licensed, not redistributable).
 * Shared between BrandMarquee and the Brands catalogue grid so both
 * surfaces render each name with the same "brand personality" font.
 */
export const BRAND_FONT_STYLES = {
  TITAN: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontStyle: 'normal' },
  FOSSIL: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  CASIO: { fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  FASTRACK: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  'RAY-BAN': {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontStyle: 'italic',
    textTransform: 'none',
    letterSpacing: 'normal',
  },
  OAKLEY: { fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontStyle: 'italic' },
  GUCCI: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: 'normal' },
  PRADA: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  VERSACE: { fontFamily: "'Playfair Display', serif", fontWeight: 800, fontStyle: 'normal' },
  'TOM FORD': { fontFamily: "'Playfair Display', serif", fontWeight: 800, fontStyle: 'normal' },
  SEIKO: { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontStyle: 'normal' },
}

/**
 * For a brand not in the curated map above (e.g. a new one just added in
 * Admin → Catalogues), there is no real "original font" to fetch — brand
 * wordmarks are almost always custom-drawn artwork, not built from any
 * downloadable typeface, and even where one exists it's licensed and not
 * ours to use. Instead, deterministically assign one of these varied
 * stand-ins from the name itself, so every new brand still gets its own
 * distinct look automatically (same name -> same font, every time) rather
 * than all unmapped brands sharing one generic fallback.
 */
const AUTO_STYLE_PRESETS = [
  { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontStyle: 'italic', textTransform: 'none', letterSpacing: 'normal' },
  { fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: 'normal' },
  { fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontStyle: 'italic' },
  { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontStyle: 'normal' },
  { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontStyle: 'normal' },
  { fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontStyle: 'normal' },
  { fontFamily: "'Playfair Display', serif", fontWeight: 800, fontStyle: 'normal' },
]

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function autoStyleForBrand(brandName) {
  const key = String(brandName || '').trim().toUpperCase()
  if (!key) return AUTO_STYLE_PRESETS[0]
  return AUTO_STYLE_PRESETS[hashString(key) % AUTO_STYLE_PRESETS.length]
}

export function getBrandFontStyle(brandName) {
  const key = String(brandName || '').trim().toUpperCase()
  return BRAND_FONT_STYLES[key] || autoStyleForBrand(brandName)
}
