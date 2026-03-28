import { Link } from 'react-router-dom'
import { ArrowRight, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { collection, documentId, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from '../components/ProductCard'
import HomeOffersSlider from '../components/HomeOffersSlider'
import Brands from '../components/Brands'
import Testimonials from '../components/Testimonials'
import GoogleReviewAssistant from '../components/GoogleReviewAssistant'
import RecentlyViewed from '../components/RecentlyViewed'
import FAQ from '../components/FAQ'
import Newsletter from '../components/Newsletter'
import StatsCounter from '../components/StatsCounter'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { getSiteWhatsAppDigits } from '../utils/siteContact'
import { getSampleProducts } from '../utils/sampleProducts'
import { useSiteContent } from '../context/SiteContentContext'
import { getCatalogueItems, openCataloguePdfInNewTabAndDownload } from '../utils/catalogue'
import './Home.css'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { content } = useSiteContent()
  const whatsappUrl = buildWhatsAppUrl(getSiteWhatsAppDigits(content) || content?.contact?.whatsappNumber)
  const featuredIdsKey = (content?.featuredProductIds || []).filter(Boolean).join(',')
  const catalogueItems = getCatalogueItems(content)
  const primaryCatalogue = catalogueItems[0]

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      if (!db) {
        setFeaturedProducts(getSampleProducts().slice(0, 8))
        setLoading(false)
        return
      }
      const curatedIds = (content?.featuredProductIds || []).filter(Boolean).slice(0, 8)
      try {
        let products = []
        if (curatedIds.length > 0) {
          const q = query(collection(db, 'products'), where(documentId(), 'in', curatedIds))
          const snapshot = await getDocs(q)
          const byId = new Map(
            snapshot.docs.map((doc) => [doc.id, { id: doc.id, ...doc.data() }])
          )
          products = curatedIds.map((id) => byId.get(id)).filter(Boolean)
        } else {
          const q = query(collection(db, 'products'), limit(8))
          const snapshot = await getDocs(q)
          products = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        }

        setFeaturedProducts(products)
      } catch (error) {
        console.error('Error fetching products:', error)
        setFeaturedProducts([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchFeaturedProducts()
    }, 100)

    return () => clearTimeout(timer)
  }, [featuredIdsKey])

  return (
    <>
      <HomeOffersSlider homeBanners={content?.homeBanners} />
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">{content?.hero?.badge}</div>
            <h1 className="hero-title">
              {content?.hero?.titlePrefix}{' '}
              <span className="highlight">{content?.hero?.titleHighlight}</span>
            </h1>
            <p className="hero-subtitle">
              {content?.hero?.subtitle}
            </p>
            <div className="hero-buttons">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Enquire Now <ArrowRight size={20} />
              </a>
              <Link to="/products" className="btn btn-outline">
                Browse Products
              </Link>
              {primaryCatalogue ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void openCataloguePdfInNewTabAndDownload(primaryCatalogue)}
                >
                  <FileText size={20} aria-hidden />
                  {(primaryCatalogue.title || primaryCatalogue.brandName || 'Catalogue').trim() || 'Catalogue'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>


      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>{content?.homeProducts?.featuredHeading || 'Featured Products'}</h2>
            <Link to="/products" className="view-all">
              {content?.homeProducts?.viewAllLabel || 'View All'} <ArrowRight size={20} />
            </Link>
          </div>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : featuredProducts.length === 0 ? (
            <div className="no-products">
              <p>Add products in Firebase or pick featured IDs in Admin. The site does not use mock inventory when Firebase is connected.</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Brands />

      <GoogleReviewAssistant />

      <Testimonials />

      <RecentlyViewed />

      <FAQ />

      <StatsCounter />

      <Newsletter />

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{content?.cta?.heading}</h2>
            <p>{content?.cta?.subheading}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Enquire Now
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
