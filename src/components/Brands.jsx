import { useEffect, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../supabase/client'
import { defaultSiteContent } from '../content/defaultSiteContent'
import { brandLogoFromName } from '../utils/productDoc'
import { useSiteContent } from '../context/SiteContentContext'
import {
  getCatalogueItems,
  getCatalogueItemForBrand,
  openCataloguePdfInNewTabAndDownload,
} from '../utils/catalogue'
import './Brands.css'

function Brands() {
  const { content } = useSiteContent()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  const heading = content?.brandsSection?.heading ?? defaultSiteContent.brandsSection.heading
  const subtitle = content?.brandsSection?.subtitle ?? defaultSiteContent.brandsSection.subtitle
  const brandsItemsKey =
    content?.brandsSection?.items && content.brandsSection.items.length > 0
      ? JSON.stringify(content.brandsSection.items)
      : 'default'

  useEffect(() => {
    let cancelled = false
    const fallbackItems =
      content?.brandsSection?.items?.length > 0
        ? content.brandsSection.items
        : defaultSiteContent.brandsSection.items

    const run = async () => {
      if (!supabase) {
        setBrands(fallbackItems)
        setLoading(false)
        return
      }
      try {
        const { data: rows, error } = await supabase.from('products').select('data').limit(500)
        if (cancelled || error) {
          if (!cancelled && error) console.warn(error)
          if (!cancelled) setBrands(fallbackItems)
          return
        }
        const names = [
          ...new Set(
            (rows || [])
              .map((r) => {
                const b = r.data?.brand
                return typeof b === 'string' ? b.trim() : ''
              })
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        if (names.length > 0) {
          setBrands(names.map((name) => ({ name, logo: brandLogoFromName(name) })))
        } else {
          setBrands(fallbackItems)
        }
      } catch (e) {
        console.warn(e)
        if (!cancelled) setBrands(fallbackItems)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [supabase, brandsItemsKey])

  const catalogueItems = getCatalogueItems(content)

  const openCatalogueForBrand = (brandName) => {
    const row = getCatalogueItemForBrand(content, brandName)
    if (row) {
      void openCataloguePdfInNewTabAndDownload(row)
    } else {
      toast('No catalogue PDF for this brand yet. Check back soon.')
    }
  }

  return (
    <section id="brands" className="brands-section">
      <div className="container">
        <div className="section-header">
          <h2>{heading}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        {catalogueItems.length > 0 ? (
          <div className="brands-catalogue-cta">
            <div className="brands-catalogue-cta-buttons">
              {catalogueItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="btn btn-primary brands-catalogue-btn"
                  onClick={() => void openCataloguePdfInNewTabAndDownload(item)}
                >
                  <FileText size={20} aria-hidden />
                  {(item.title || item.brandName || 'Catalogue').trim() || 'Catalogue'}
                </button>
              ))}
            </div>
            <p className="brands-catalogue-hint">
              Opens in a new tab and starts a download when your browser allows it.
            </p>
          </div>
        ) : null}

        {loading ? (
          <p className="section-subtitle" style={{ marginTop: '16px' }}>
            Loading brands…
          </p>
        ) : brands.length === 0 ? (
          <p className="section-subtitle" style={{ marginTop: '16px' }}>
            Brand list will appear when products include a <code>brand</code> field in Supabase.
          </p>
        ) : (
          <div className="brands-grid">
            {brands.map((brand) => (
              <div key={brand.name} className="brand-card">
                <div className="brand-logo">{brand.logo}</div>
                <div className="brand-name">{brand.name}</div>
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
