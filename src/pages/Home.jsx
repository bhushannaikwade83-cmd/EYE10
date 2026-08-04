import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Glasses, Watch, Gift, CreditCard, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import ProductCard from '../components/ProductCard'
import About from '../components/About'
import Services from '../components/Services'
import Brands from '../components/Brands'
import BrandMarquee from '../components/BrandMarquee'
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
import logoImage from '../assets/eye10-logo.png'
import './Home.css'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { content } = useSiteContent()
  const whatsappUrl = buildWhatsAppUrl(getSiteWhatsAppDigits(content))
  const featuredIdsKey = (content?.featuredProductIds || []).filter(Boolean).join(',')
  const catalogueItems = getCatalogueItems(content)
  const primaryCatalogue = catalogueItems[0]

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      if (!supabase) {
        setFeaturedProducts(getSampleProducts().slice(0, 8))
        setLoading(false)
        return
      }
      const curatedIds = (content?.featuredProductIds || []).filter(Boolean).slice(0, 8)
      try {
        let products = []
        if (curatedIds.length > 0) {
          const { data: rows, error } = await supabase.from('products').select('id, data').in('id', curatedIds)
          if (error) throw error
          const byId = new Map(
            (rows || []).map((r) => [
              r.id,
              { id: r.id, ...(r.data && typeof r.data === 'object' ? r.data : {}) },
            ])
          )
          products = curatedIds.map((pid) => byId.get(pid)).filter(Boolean)
        } else {
          const { data: rows, error } = await supabase.from('products').select('id, data').limit(8)
          if (error) throw error
          products = (rows || []).map((r) => ({
            id: r.id,
            ...(r.data && typeof r.data === 'object' ? r.data : {}),
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
      <section className="hero hero-showcase">
        <div className="hero-float-img hero-float-img-watch-1">
          <img
            src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400"
            alt="Analog watch"
            loading="lazy"
          />
        </div>
        <div className="hero-float-img hero-float-img-watch-2">
          <img
            src="https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=400"
            alt="Chronograph watch"
            loading="lazy"
          />
        </div>
        <div className="hero-float-img hero-float-img-eyewear-1">
          <img
            src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400"
            alt="Aviator sunglasses"
            loading="lazy"
          />
        </div>
        <div className="hero-float-img hero-float-img-eyewear-2">
          <img
            src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400"
            alt="Round frame glasses"
            loading="lazy"
          />
        </div>

        <div className="container">
          <div className="hero-content">
            <img
              src={logoImage}
              alt={content?.brand?.name || 'EYE10'}
              className="hero-logo"
            />
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

      <BrandMarquee />


      <section className="category-section">
        <div className="container">
          <div className="category-grid">
            <Link to="/products?category=glasses" className="category-card">
              <Glasses size={48} className="category-icon" />
              <h3>Eyewear</h3>
              <p>Glasses & sunglasses for every face and style</p>
            </Link>
            <Link to="/products?category=watches" className="category-card">
              <Watch size={48} className="category-icon" />
              <h3>Watches</h3>
              <p>Analog, digital & mechanical watches for every wrist</p>
            </Link>
          </div>
        </div>
      </section>

      <About />

      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>We Also Deal In</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <Watch size={40} className="feature-icon" />
              <h3>Watch Straps &amp; Batteries</h3>
              <p>Genuine leather, metal &amp; PVC straps with original brand batteries.</p>
            </div>
            <div className="feature-card">
              <Gift size={40} className="feature-icon" />
              <h3>Corporate Gifting</h3>
              <p>Curated eyewear and watch gifting solutions for your team or clients.</p>
            </div>
            <div className="feature-card">
              <CreditCard size={40} className="feature-icon" />
              <h3>Easy EMI Options</h3>
              <p>Flexible EMI plans available on premium eyewear and watches.</p>
            </div>
            <div className="feature-card">
              <Sparkles size={40} className="feature-icon" />
              <h3>Lens Care &amp; Accessories</h3>
              <p>Cleaning kits, cases, and accessories for your glasses and watches.</p>
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
              <p>No featured products are available at the moment.</p>
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

      <Services />

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
