import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { defaultSiteContent } from '../content/defaultSiteContent'
import { brandLogoFromName } from '../utils/productDoc'
import { useSiteContent } from '../context/SiteContentContext'
import { getCatalogueItemForBrand, getCatalogueItems, openCataloguePdfInNewTabAndDownload } from '../utils/catalogue'
import { getBrandFontStyle } from '../utils/brandFonts'
import './Brands.css'

function Brands() {
  const { content } = useSiteContent()

  const heading = content?.brandsSection?.heading ?? defaultSiteContent.brandsSection.heading
  const subtitle = content?.brandsSection?.subtitle ?? defaultSiteContent.brandsSection.subtitle
  const brands = useMemo(
    () =>
      getCatalogueItems(content).map((x) => ({
        name: x.brandName,
        logo: brandLogoFromName(x.brandName),
      })),
    [content]
  )

  const openCatalogueForBrand = (brandName) => {
    const row = getCatalogueItemForBrand(content, brandName)
    if (!row) return
    void openCataloguePdfInNewTabAndDownload(row)
  }

  return (
    <section id="brands" className="brands-section">
      <div className="container">
        <div className="section-header">
          <h2>{heading}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        {brands.length === 0 ? (
          <p className="section-subtitle" style={{ marginTop: '16px' }}>
            No catalogue PDFs available yet.
          </p>
        ) : (
          <div className="brands-grid">
            {brands.map((brand) => (
              <div key={brand.name} className="brand-card">
                <div className="brand-logo" style={getBrandFontStyle(brand.name)}>{brand.logo}</div>
                <div className="brand-name" style={getBrandFontStyle(brand.name)}>{brand.name}</div>
                <button type="button" className="brand-download" onClick={() => openCatalogueForBrand(brand.name)}>
                  <Download size={16} aria-hidden />
                  Catalogue
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Brands
