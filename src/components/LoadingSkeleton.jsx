import './LoadingSkeleton.css'

function LoadingSkeleton({ type = 'product' }) {
  if (type === 'product') {
    return (
      <div className="skeleton-product-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
          <div className="skeleton-line skeleton-price"></div>
        </div>
      </div>
    )
  }

  if (type === 'product-detail') {
    return (
      <div className="skeleton-product-detail">
        <div className="skeleton-detail-image"></div>
        <div className="skeleton-detail-info">
          <div className="skeleton-line skeleton-detail-title"></div>
          <div className="skeleton-line skeleton-detail-text"></div>
          <div className="skeleton-line skeleton-detail-text"></div>
          <div className="skeleton-line skeleton-detail-price"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="skeleton-card">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  )
}

export default LoadingSkeleton
