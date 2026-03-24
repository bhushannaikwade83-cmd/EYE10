import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { ArrowLeft, Heart, MessageSquare, Phone, GitCompare, Bell } from 'lucide-react'
import ShareButtons from '../components/ShareButtons'
import RelatedProducts from '../components/RelatedProducts'
import ProductReviews from '../components/ProductReviews'
import ImageZoom from '../components/ImageZoom'
import SizeGuide from '../components/SizeGuide'
import { addToRecentlyViewed, addToWishlist, removeFromWishlist, isInWishlist } from '../utils/localStorage'
import { addToComparison } from '../components/ProductComparison'
import { addPriceAlert } from '../components/PriceDropAlerts'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { useSiteContent } from '../context/SiteContentContext'
import toast from 'react-hot-toast'
import './ProductDetail.css'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const { content } = useSiteContent()
  const whatsappUrl = buildWhatsAppUrl(content?.contact?.whatsappNumber)
  const callPhone = content?.navbar?.phone || '+91 99999 99999'

  useEffect(() => {
    const fetchProduct = async () => {
      if (!db) {
        const sampleProduct = getSampleProduct(id)
        if (sampleProduct) setProduct(sampleProduct)
        setLoading(false)
        return
      }
      try {
        const docRef = doc(db, 'products', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() })
        } else {
          // Fallback to sample data
          const sampleProduct = getSampleProduct(id)
          if (sampleProduct) {
            setProduct(sampleProduct)
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        const sampleProduct = getSampleProduct(id)
        if (sampleProduct) {
          setProduct(sampleProduct)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  useEffect(() => {
    if (product) {
      // Add to recently viewed
      addToRecentlyViewed(product)
      
      // Check if in wishlist
      setIsFavorite(isInWishlist(product.id))
    }
  }, [product])

  const handleWishlistToggle = () => {
    if (!product) return
    
    if (isFavorite) {
      removeFromWishlist(product.id)
      setIsFavorite(false)
      toast.success('Removed from wishlist')
    } else {
      const added = addToWishlist(product)
      if (added) {
        setIsFavorite(true)
        toast.success('Added to wishlist')
      } else {
        toast.error('Already in wishlist')
      }
    }
  }


  if (loading) {
    return (
      <main>
        <div className="container">
          <div className="loading">Loading product...</div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main>
        <div className="container">
          <div className="no-product">
            <h2>Product not found</h2>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Back to Products
            </button>
          </div>
        </div>
      </main>
    )
  }

  const images = product.images || [product.image || 'https://via.placeholder.com/600']

  return (
    <main>
      <div className="product-detail-page">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="product-detail-layout">
            <div className="product-images">
              <div className="main-image">
                <ImageZoom src={images[selectedImage]} alt={product.name} />
                <button
                  className="favorite-btn"
                  onClick={handleWishlistToggle}
                  aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              {images.length > 1 && (
                <div className="image-thumbnails">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className={selectedImage === index ? 'active' : ''}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="product-info">
              <div className="product-header">
                <h1>{product.name}</h1>
                <p className="product-brand">{product.brand || 'EYE10'}</p>
              </div>

              <div className="product-rating">
                <div className="stars">★★★★★</div>
                <span>(4.5) • 120 Reviews</span>
              </div>

              <div className="product-price-section">
                {product.originalPrice && (
                  <span className="original-price">₹{product.originalPrice}</span>
                )}
                <span className="current-price">₹{product.price}</span>
                {product.discount && (
                  <span className="discount">({product.discount}% OFF)</span>
                )}
              </div>

              <div className="product-description">
                <h3>Description</h3>
                <p>
                  {product.description ||
                    'Premium quality eyewear designed for comfort and style. Made with high-quality materials and featuring UV protection. Perfect for everyday wear.'}
                </p>
              </div>

              <div className="product-features">
                <h3>Features</h3>
                <ul>
                  <li>UV Protection</li>
                  <li>Scratch Resistant</li>
                  <li>Lightweight Design</li>
                  <li>Premium Materials</li>
                </ul>
              </div>

              <div className="product-specs">
                <div className="spec-item">
                  <span className="spec-label">Frame:</span>
                  <span className="spec-value">{product.frameType || 'Full Rim'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">
                    {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                  </span>
                </div>
                <div className="spec-item">
                  <SizeGuide />
                </div>
              </div>

              <div className="product-actions">
                <div className="product-actions-primary">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <MessageSquare size={20} />
                    Enquire Now
                  </a>
                  <a href={`tel:${callPhone.replace(/\s+/g, '')}`} className="btn btn-outline">
                    <Phone size={20} />
                    Call Us
                  </a>
                </div>
                <div className="product-actions-secondary">
                  <button 
                    onClick={() => addToComparison(product)} 
                    className="btn btn-outline"
                    title="Add to comparison"
                    aria-label="Add to comparison"
                  >
                    <GitCompare size={20} />
                    Compare
                  </button>
                  <button
                    onClick={() => addPriceAlert(product)}
                    className="btn btn-outline"
                    title="Get price drop alert"
                    aria-label="Set price drop alert"
                  >
                    <Bell size={20} />
                    Price Alert
                  </button>
                </div>
              </div>

              <div className="product-share">
                <h3>Share this product</h3>
                <ShareButtons product={product} url={window.location.href} />
              </div>

              <div className="product-benefits">
                <div className="benefit-item">
                  <strong>Authentic Products</strong>
                  <span>100% genuine eyewear</span>
                </div>
                <div className="benefit-item">
                  <strong>Expert Service</strong>
                  <span>Professional assistance</span>
                </div>
                <div className="benefit-item">
                  <strong>Warranty</strong>
                  <span>1 year manufacturer warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />

      <RelatedProducts currentProduct={product} />
    </main>
  )
}

function getSampleProduct(id) {
  const sampleProducts = {
    '1': {
      id: '1',
      name: 'Classic Aviator Sunglasses',
      price: 2999,
      originalPrice: 3999,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'EYE10',
      discount: 25,
      frameType: 'Full Rim',
      description: 'Timeless aviator design with UV protection and premium metal frame. Perfect for everyday wear.',
    },
    '2': {
      id: '2',
      name: 'Round Frame Glasses',
      price: 2499,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'EYE10',
      discount: 17,
      frameType: 'Full Rim',
      description: 'Vintage-inspired round frames perfect for a classic look. Lightweight and comfortable.',
    },
    '3': {
      id: '3',
      name: 'Cat Eye Sunglasses',
      price: 3499,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'sunglasses',
      brand: 'Ray-Ban',
      frameType: 'Full Rim',
      description: 'Elegant cat-eye design with polarized lenses and stylish frame. A fashion-forward choice.',
    },
    '4': {
      id: '4',
      name: 'Square Frame Glasses',
      price: 2199,
      image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
      category: 'glasses',
      brand: 'EYE10',
      frameType: 'Full Rim',
      description: 'Modern square frames with anti-glare coating and lightweight design.',
    },
    '5': {
      id: '5',
      name: 'Wayfarer Sunglasses',
      price: 2799,
      originalPrice: 3499,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Oakley',
      discount: 20,
      frameType: 'Full Rim',
      description: 'Iconic wayfarer style with durable acetate frame and UV400 protection.',
    },
    '6': {
      id: '6',
      name: 'Oval Frame Glasses',
      price: 2299,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'EYE10',
      frameType: 'Full Rim',
      description: 'Comfortable oval frames with blue light filter technology.',
    },
    '7': {
      id: '7',
      name: 'Rimless Glasses',
      price: 1899,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
      category: 'glasses',
      brand: 'Gucci',
      discount: 24,
      frameType: 'Rimless',
      description: 'Ultra-lightweight rimless design for maximum comfort and style.',
    },
    '8': {
      id: '8',
      name: 'Sport Sunglasses',
      price: 4499,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Oakley',
      frameType: 'Full Rim',
      description: 'High-performance sports sunglasses with impact-resistant lenses.',
    },
    '9': {
      id: '9',
      name: 'Browline Glasses',
      price: 2699,
      originalPrice: 3299,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'Prada',
      discount: 18,
      frameType: 'Browline',
      description: 'Sophisticated browline frames combining metal and acetate materials.',
    },
    '10': {
      id: '10',
      name: 'Oversized Sunglasses',
      price: 3799,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Versace',
      frameType: 'Full Rim',
      description: 'Luxury oversized sunglasses with gradient lenses and designer frame.',
    },
  }
  return sampleProducts[id]
}

export default ProductDetail
