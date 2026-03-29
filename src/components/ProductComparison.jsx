import { useState, useEffect } from 'react'
import { X, Trash2, GitCompare } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useResolvedMediaUrl } from '../hooks/useResolvedMediaUrl'
import './ProductComparison.css'

function ComparisonProductImage({ product }) {
  const { url } = useResolvedMediaUrl(product?.image || '')
  return (
    <img
      src={url || 'https://via.placeholder.com/150'}
      alt={product.name}
      className="comparison-image"
    />
  )
}

function ProductComparison({ onClose: externalOnClose }) {
  const [comparisonProducts, setComparisonProducts] = useState([])
  const [isOpen, setIsOpen] = useState(externalOnClose ? true : false)
  
  const handleClose = () => {
    setIsOpen(false)
    if (externalOnClose) {
      externalOnClose()
    }
  }

  const syncFromStorage = () => {
    const saved = localStorage.getItem('comparisonProducts')
    let nextProducts = []

    if (saved) {
      try {
        nextProducts = JSON.parse(saved)
      } catch (_) {
        nextProducts = []
      }
    }

    setComparisonProducts((prevProducts) => {
      const prevSerialized = JSON.stringify(prevProducts)
      const nextSerialized = JSON.stringify(nextProducts)
      return prevSerialized === nextSerialized ? prevProducts : nextProducts
    })
  }

  useEffect(() => {
    syncFromStorage()
  }, [])

  useEffect(() => {
    window.addEventListener('comparisonUpdated', syncFromStorage)
    window.addEventListener('storage', syncFromStorage)
    return () => {
      window.removeEventListener('comparisonUpdated', syncFromStorage)
      window.removeEventListener('storage', syncFromStorage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('comparisonProducts', JSON.stringify(comparisonProducts))
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('comparisonUpdated'))
  }, [comparisonProducts])

  const addToComparison = (product) => {
    if (comparisonProducts.length >= 4) {
      toast.error('Maximum 4 products can be compared')
      return
    }
    if (comparisonProducts.find((p) => p.id === product.id)) {
      toast.error('Product already in comparison')
      return
    }
    setComparisonProducts([...comparisonProducts, product])
    toast.success('Added to comparison')
  }

  const removeFromComparison = (productId) => {
    setComparisonProducts(comparisonProducts.filter((p) => p.id !== productId))
    toast.success('Removed from comparison')
  }

  const clearComparison = () => {
    setComparisonProducts([])
    toast.success('Comparison cleared')
  }

  return (
    <>
      {comparisonProducts.length > 0 && (
        <button
          className="comparison-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open comparison"
          title={`Compare ${comparisonProducts.length} product${comparisonProducts.length > 1 ? 's' : ''}`}
        >
          <GitCompare size={20} />
          <span className="comparison-count">{comparisonProducts.length}</span>
        </button>
      )}

      {isOpen && (
        <div className="comparison-overlay" onClick={handleClose}>
          <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
            <div className="comparison-header">
              <h2>Compare Products</h2>
              <div className="comparison-actions">
                <button onClick={clearComparison} className="btn-clear">
                  Clear All
                </button>
                <button onClick={handleClose} className="btn-close">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="comparison-content">
              <div className="comparison-table">
                <div className="comparison-row comparison-header-row">
                  <div className="comparison-cell comparison-label">Product</div>
                  {comparisonProducts.map((product) => (
                    <div key={product.id} className="comparison-cell comparison-product">
                      <button
                        onClick={() => removeFromComparison(product.id)}
                        className="remove-btn"
                        aria-label="Remove product"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ComparisonProductImage product={product} />
                      <h3>{product.name}</h3>
                      <Link
                        to={`/product/${product.id}`}
                        className="comparison-link"
                        onClick={handleClose}
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="comparison-row">
                  <div className="comparison-cell comparison-label">Price</div>
                  {comparisonProducts.map((product) => (
                    <div key={product.id} className="comparison-cell">
                      <span className="price">
                        ₹{product.price?.toLocaleString() || 'N/A'}
                      </span>
                      {product.originalPrice && (
                        <span className="original-price">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="comparison-row">
                  <div className="comparison-cell comparison-label">Brand</div>
                  {comparisonProducts.map((product) => (
                    <div key={product.id} className="comparison-cell">
                      {product.brand || 'N/A'}
                    </div>
                  ))}
                </div>

                <div className="comparison-row">
                  <div className="comparison-cell comparison-label">Category</div>
                  {comparisonProducts.map((product) => (
                    <div key={product.id} className="comparison-cell">
                      {product.category || 'N/A'}
                    </div>
                  ))}
                </div>

                <div className="comparison-row">
                  <div className="comparison-cell comparison-label">Discount</div>
                  {comparisonProducts.map((product) => (
                    <div key={product.id} className="comparison-cell">
                      {product.discount ? `${product.discount}% OFF` : 'No discount'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Export function to add products to comparison
export const addToComparison = (product) => {
  const saved = localStorage.getItem('comparisonProducts')
  const comparisonProducts = saved ? JSON.parse(saved) : []
  
  if (comparisonProducts.length >= 4) {
    toast.error('Maximum 4 products can be compared')
    return false
  }
  if (comparisonProducts.find((p) => p.id === product.id)) {
    toast.error('Product already in comparison')
    return false
  }
  
  comparisonProducts.push(product)
  localStorage.setItem('comparisonProducts', JSON.stringify(comparisonProducts))
  window.dispatchEvent(new Event('comparisonUpdated'))
  toast.success('Added to comparison')
  return true
}

export default ProductComparison
