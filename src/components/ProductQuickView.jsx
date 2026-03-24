import { useState, useEffect } from 'react'
import { X, Heart, MessageSquare, Phone, GitCompare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { addToWishlist, removeFromWishlist, isInWishlist } from '../utils/localStorage'
import { addToComparison } from './ProductComparison'
import toast from 'react-hot-toast'
import ImageZoom from './ImageZoom'
import './ProductQuickView.css'

function ProductQuickView({ product, isOpen, onClose }) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (product) {
      setIsFavorite(isInWishlist(product.id))
    }
  }, [product])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const handleWishlistToggle = () => {
    if (isFavorite) {
      removeFromWishlist(product.id)
      setIsFavorite(false)
      toast.success('Removed from wishlist')
    } else {
      const added = addToWishlist(product)
      if (added) {
        setIsFavorite(true)
        toast.success('Added to wishlist')
      }
    }
  }

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="quick-view-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        <div className="quick-view-content">
          <div className="quick-view-image">
            <ImageZoom src={product.image || 'https://via.placeholder.com/600'} alt={product.name} />
            {product.discount && (
              <span className="quick-view-discount">-{product.discount}%</span>
            )}
            <button
              className="quick-view-favorite"
              onClick={handleWishlistToggle}
              aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="quick-view-info">
            <h2>{product.name}</h2>
            <p className="quick-view-brand">{product.brand || 'EYE10'}</p>

            <div className="quick-view-rating">
              <div className="stars">★★★★★</div>
              <span>(4.5) • 120 Reviews</span>
            </div>

            <div className="quick-view-price">
              {product.originalPrice && (
                <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
              )}
              <span className="current-price">₹{product.price?.toLocaleString()}</span>
              {product.discount && (
                <span className="discount">({product.discount}% OFF)</span>
              )}
            </div>

            <p className="quick-view-description">
              {product.description || 'Premium quality eyewear designed for comfort and style. Made with high-quality materials and featuring UV protection.'}
            </p>

            <div className="quick-view-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>UV Protection</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Scratch Resistant</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Lightweight Design</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Premium Materials</span>
              </div>
            </div>

            <div className="quick-view-actions">
              <Link to={`/product/${product.id}`} className="btn btn-primary" onClick={onClose}>
                <MessageSquare size={20} />
                View Full Details
              </Link>
              <a href="tel:+919999999999" className="btn btn-outline">
                <Phone size={20} />
                Call Us
              </a>
              <button
                onClick={() => {
                  addToComparison(product)
                  toast.success('Added to comparison')
                }}
                className="btn btn-outline"
              >
                <GitCompare size={20} />
                Compare
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductQuickView
