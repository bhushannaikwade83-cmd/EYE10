import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
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
import { getSitePhone, getSiteWhatsAppDigits } from '../utils/siteContact'
import { getSampleProductById } from '../utils/sampleProducts'
import { normalizeBenefitList, normalizeFeatureList } from '../utils/productDoc'
import { useSiteContent } from '../context/SiteContentContext'
import { useResolvedMediaUrls } from '../hooks/useResolvedMediaUrl'
import toast from 'react-hot-toast'
import './ProductDetail.css'

const IMG_PLACEHOLDER = 'https://via.placeholder.com/600?text=EYE10'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const { content } = useSiteContent()
  const whatsappUrl = buildWhatsAppUrl(getSiteWhatsAppDigits(content))
  const callPhone = getSitePhone(content)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!supabase) {
        const sampleProduct = getSampleProductById(id)
        if (sampleProduct) setProduct(sampleProduct)
        setLoading(false)
        return
      }
      try {
        const { data: row, error } = await supabase.from('products').select('id, data').eq('id', id).maybeSingle()

        if (error) throw error
        if (row?.data && typeof row.data === 'object') {
          setProduct({ id: row.id, ...row.data })
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  useEffect(() => {
    setSelectedImage(0)
  }, [id])

  const imageList = useMemo(() => {
    if (!product) return []
    return Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : [product.image].filter(Boolean)
  }, [product])

  const videoList = useMemo(() => {
    if (!product || !Array.isArray(product.videos)) return []
    return product.videos.filter(Boolean)
  }, [product])

  const { urls: resolvedImages, loading: imagesLoading } = useResolvedMediaUrls(imageList)
  const { urls: resolvedVideos } = useResolvedMediaUrls(videoList)

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

  const displayImages = useMemo(
    () =>
      imageList.map((raw, index) => {
        const resolved = String(resolvedImages[index] || '').trim()
        if (resolved) return resolved
        if (imagesLoading) return IMG_PLACEHOLDER
        const fallback = String(raw || '').trim()
        return fallback || IMG_PLACEHOLDER
      }),
    [imageList, resolvedImages, imagesLoading]
  )


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

  const zoomSrc = displayImages[selectedImage] || displayImages[0] || IMG_PLACEHOLDER
  const featureList = normalizeFeatureList(product)
  const benefitList = normalizeBenefitList(product)
  const rating =
    typeof product.rating === 'number' && !Number.isNaN(product.rating) ? product.rating : null
  const reviewCount =
    product.reviewCount != null && product.reviewCount !== ''
      ? Number(product.reviewCount)
      : null

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
                <ImageZoom src={zoomSrc || IMG_PLACEHOLDER} alt={product.name} />
                <button
                  className="favorite-btn"
                  onClick={handleWishlistToggle}
                  aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              {imageList.length > 1 && (
                <div className="image-thumbnails">
                  {displayImages.map((img, index) => (
                    <img
                      key={index}
                      src={img || IMG_PLACEHOLDER}
                      alt={`${product.name} ${index + 1}`}
                      className={selectedImage === index ? 'active' : ''}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}

              {videoList.length > 0 && (
                <div className="video-thumbnails">
                  {videoList.map((src, idx) => (
                    <video
                      key={`${src}-${idx}`}
                      src={resolvedVideos[idx] || src}
                      muted
                      playsInline
                      preload="metadata"
                      className="product-video-thumb"
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

              {(rating != null || (reviewCount != null && !Number.isNaN(reviewCount))) && (
                <div className="product-rating">
                  {rating != null && (
                    <div className="stars" aria-hidden>
                      {'★'.repeat(Math.min(5, Math.max(0, Math.round(rating))))}
                      {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(0, Math.round(rating)))))}
                    </div>
                  )}
                  <span>
                    {rating != null ? `(${rating.toFixed(1)})` : ''}
                    {rating != null && reviewCount != null ? ' • ' : ''}
                    {reviewCount != null && !Number.isNaN(reviewCount)
                      ? `${reviewCount} Review${reviewCount === 1 ? '' : 's'}`
                      : ''}
                  </span>
                </div>
              )}

              <div className="product-price-section">
                {product.originalPrice && (
                  <span className="original-price">₹{product.originalPrice}</span>
                )}
                <span className="current-price">₹{product.price}</span>
                {product.discount && (
                  <span className="discount">({product.discount}% OFF)</span>
                )}
              </div>

              {product.description ? (
                <div className="product-description">
                  <h3>Description</h3>
                  <p>{product.description}</p>
                </div>
              ) : null}

              {featureList.length > 0 ? (
                <div className="product-features">
                  <h3>Features</h3>
                  <ul>
                    {featureList.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="product-specs">
                <div className="spec-item">
                  <span className="spec-label">Frame:</span>
                  <span className="spec-value">{product.frameType || 'Full Rim'}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">
                    {product.category
                      ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
                      : '—'}
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

              {benefitList.length > 0 ? (
                <div className="product-benefits">
                  {benefitList.map((b, i) => (
                    <div key={`${b.title}-${i}`} className="benefit-item">
                      <strong>{b.title}</strong>
                      {b.subtitle ? <span>{b.subtitle}</span> : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />

      <RelatedProducts currentProduct={product} />
    </main>
  )
}

export default ProductDetail
