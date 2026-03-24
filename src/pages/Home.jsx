import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from '../components/ProductCard'
import About from '../components/About'
import Services from '../components/Services'
import Brands from '../components/Brands'
import Testimonials from '../components/Testimonials'
import GoogleReviewAssistant from '../components/GoogleReviewAssistant'
import RecentlyViewed from '../components/RecentlyViewed'
import FAQ from '../components/FAQ'
import Newsletter from '../components/Newsletter'
import StatsCounter from '../components/StatsCounter'
import AdditionalServices from '../components/AdditionalServices'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { useSiteContent } from '../context/SiteContentContext'
import './Home.css'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { content } = useSiteContent()
  const whatsappUrl = buildWhatsAppUrl(content?.contact?.whatsappNumber)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      if (!db) {
        setFeaturedProducts(getSampleProducts().slice(0, 8))
        setLoading(false)
        return
      }
      try {
        const q = query(collection(db, 'products'), limit(8))
        const snapshot = await getDocs(q)
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        
        // Always use sample products if Firebase returns empty or has no products
        if (products.length === 0) {
          console.log('No products in Firebase, using sample products')
          setFeaturedProducts(getSampleProducts().slice(0, 8))
        } else {
          setFeaturedProducts(products)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        // Fallback to sample data if Firebase is not configured or has errors
        console.log('Using sample products due to error')
        setFeaturedProducts(getSampleProducts().slice(0, 8))
      } finally {
        setLoading(false)
      }
    }

    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      fetchFeaturedProducts()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
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
            </div>
          </div>
        </div>
      </section>


      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">
              View All <ArrowRight size={20} />
            </Link>
          </div>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : featuredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products available at the moment.</p>
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

      <About />
      
      <AdditionalServices />
      
      <Services />

      <Testimonials />
      
      <GoogleReviewAssistant />

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

// Sample products fallback
function getSampleProducts() {
  return [
    {
      id: '1',
      name: 'Classic Aviator Sunglasses',
      price: 2999,
      originalPrice: 3999,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'EYE10',
      discount: 25,
    },
    {
      id: '2',
      name: 'Round Frame Glasses',
      price: 2499,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'EYE10',
      discount: 17,
    },
    {
      id: '3',
      name: 'Cat Eye Sunglasses',
      price: 3499,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'sunglasses',
      brand: 'Ray-Ban',
    },
    {
      id: '4',
      name: 'Square Frame Glasses',
      price: 2199,
      image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
      category: 'glasses',
      brand: 'EYE10',
    },
    {
      id: '5',
      name: 'Wayfarer Sunglasses',
      price: 2799,
      originalPrice: 3499,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Oakley',
      discount: 20,
    },
    {
      id: '6',
      name: 'Oval Frame Glasses',
      price: 2299,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'EYE10',
    },
    {
      id: '7',
      name: 'Rimless Glasses',
      price: 1899,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
      category: 'glasses',
      brand: 'Gucci',
      discount: 24,
    },
    {
      id: '8',
      name: 'Sport Sunglasses',
      price: 4499,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Oakley',
    },
    {
      id: '9',
      name: 'Browline Glasses',
      price: 2699,
      originalPrice: 3299,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'Prada',
      discount: 18,
    },
    {
      id: '10',
      name: 'Oversized Sunglasses',
      price: 3799,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Versace',
    },
  ]
}

export default Home
