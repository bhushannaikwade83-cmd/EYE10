import { useEffect, useState } from 'react'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../firebase/config'
import { defaultSiteContent } from '../content/defaultSiteContent'
import { brandLogoFromName } from '../utils/productDoc'
import { useSiteContent } from '../context/SiteContentContext'
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
      if (!db) {
        setBrands(fallbackItems)
        setLoading(false)
        return
      }
      try {
        const snap = await getDocs(query(collection(db, 'products'), limit(500)))
        if (cancelled) return
        const names = [
          ...new Set(
            snap.docs
              .map((d) => {
                const b = d.data()?.brand
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
  }, [db, brandsItemsKey])

  const pdfUrl = (content?.catalogue?.pdfUrl || '').trim()
  const catalogueLabel = (content?.catalogue?.title || 'Download catalogue').trim() || 'Download catalogue'

  const openCatalogue = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    } else {
      toast('Full catalogue PDF is not available yet. Check back soon.')
    }
  }

  return (
    <section id="brands" className="brands-section">
      <div className="container">
        <div className="section-header">
          <h2>{heading}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        {pdfUrl ? (
          <div className="brands-catalogue-cta">
            <button type="button" className="btn btn-primary brands-catalogue-btn" onClick={openCatalogue}>
              <FileText size={20} aria-hidden />
              {catalogueLabel}
            </button>
            <p className="brands-catalogue-hint">PDF opens in a new tab — save or print from your browser.</p>
          </div>
        ) : null}

        {loading ? (
          <p className="section-subtitle" style={{ marginTop: '16px' }}>
            Loading brands…
          </p>
        ) : brands.length === 0 ? (
          <p className="section-subtitle" style={{ marginTop: '16px' }}>
            Brand list will appear when products include a <code>brand</code> field in Firebase.
          </p>
        ) : (
          <div className="brands-grid">
            {brands.map((brand) => (
              <div key={brand.name} className="brand-card">
                <div className="brand-logo">{brand.logo}</div>
                <div className="brand-name">{brand.name}</div>
                <button type="button" className="brand-download" onClick={openCatalogue}>
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
