import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, MessageSquare, GitCompare, Zap, Bell } from 'lucide-react'
import { addToComparison } from './ProductComparison'
import { addPriceAlert } from './PriceDropAlerts'
import ProductQuickView from './ProductQuickView'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { getSiteWhatsAppDigits } from '../utils/siteContact'
import { useSiteContent } from '../context/SiteContentContext'
import { ProductImage } from './ProductImage'
import './ProductCard.css'

function ProductCard({ product }) {
  const [showQuickView, setShowQuickView] = useState(false)
  const { content } = useSiteContent()
  const whatsappUrl = buildWhatsAppUrl(getSiteWhatsAppDigits(content))

  // Determine badges
  const badges = []
  if (product.isNew) badges.push({ text: 'New', type: 'new' })
  if (product.bestSeller) badges.push({ text: 'Best Seller', type: 'bestseller' })
  if (product.limitedEdition) badges.push({ text: 'Limited', type: 'limited' })
  if (product.stock === 0) badges.push({ text: 'Out of Stock', type: 'outofstock' })
  else if (product.stock && product.stock < 10) badges.push({ text: 'Low Stock', type: 'lowstock' })

  return (
    <>
      <div className="product-card">
        <div className="product-image-container">
          <Link
            to={`/product/${product.id}`}
            className="product-image-link"
            aria-label={`View ${product.name}`}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              className="product-image"
              loading="lazy"
            />
          </Link>

          <div className="product-overlay">
            <button
              className="overlay-btn"
              type="button"
              onClick={() => setShowQuickView(true)}
              title="Quick view"
              aria-label="Quick view"
            >
              <Zap size={20} />
            </button>
            <Link
              to={`/product/${product.id}`}
              className="overlay-btn"
              title="View details"
              aria-label="View product details"
            >
              <Eye size={20} />
            </Link>
            <button
              className="overlay-btn"
              type="button"
              onClick={() => addToComparison(product)}
              title="Add to comparison"
              aria-label="Add to comparison"
            >
              <GitCompare size={20} />
            </button>
            <button
              className="overlay-btn"
              type="button"
              onClick={() => addPriceAlert(product)}
              title="Set price alert"
              aria-label="Set price drop alert"
            >
              <Bell size={20} />
            </button>
          </div>

          {product.discount && (
            <span className="discount-badge">-{product.discount}%</span>
          )}

          {badges.length > 0 && (
            <div className="product-badges">
              {badges.map((badge, idx) => (
                <span key={idx} className={`product-badge badge-${badge.type}`}>
                  {badge.text}
                </span>
              ))}
            </div>
          )}
        </div>

        <Link to={`/product/${product.id}`} className="product-link product-info-link">
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-brand">{product.brand || 'EYE10'}</p>
            <div className="product-price">
              {product.originalPrice && (
                <span className="original-price">{'\u20B9'}{product.originalPrice}</span>
              )}
              <span className="current-price">{'\u20B9'}{product.price}</span>
            </div>
          </div>
        </Link>

        <div className="product-card-actions">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="enquire-btn"
          >
            <MessageSquare size={18} />
            Enquire Now
          </a>
          <button
            type="button"
            className="compare-btn-visible"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addToComparison(product)
            }}
            title="Add to comparison"
            aria-label="Add to comparison"
          >
            <GitCompare size={18} />
            <span>Compare</span>
          </button>
        </div>
      </div>

      <ProductQuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  )
}

export default ProductCard
