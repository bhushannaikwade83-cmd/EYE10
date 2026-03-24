import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import toast from 'react-hot-toast'
import './PriceDropAlerts.css'

function PriceDropAlerts() {
  const [alerts, setAlerts] = useState([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('priceDropAlerts')
    if (saved) {
      setAlerts(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('priceDropAlerts', JSON.stringify(alerts))
  }, [alerts])

  const checkPriceDrops = () => {
    alerts.forEach((alert) => {
      // In a real app, you'd fetch current price from API
      // For now, simulate price check
      const currentPrice = alert.currentPrice
      if (alert.trackedPrice > currentPrice) {
        const dropAmount = alert.trackedPrice - currentPrice
        const dropPercent = ((dropAmount / alert.trackedPrice) * 100).toFixed(0)
        toast.success(
          `Price Drop Alert! ${alert.productName} is now ₹${currentPrice} (${dropPercent}% off)`,
          { duration: 6000 }
        )
        // Remove alert after notification
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id))
      }
    })
  }

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
    toast.success('Price alert removed')
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <>
      <button
        className="price-alert-toggle"
        onClick={() => setShowModal(true)}
        aria-label="View price alerts"
        title={`${alerts.length} price alert${alerts.length > 1 ? 's' : ''} active`}
      >
        <Bell size={20} />
        <span className="alert-count">{alerts.length}</span>
      </button>

      {showModal && (
        <div className="price-alert-overlay" onClick={() => setShowModal(false)}>
          <div className="price-alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="price-alert-header">
              <h2>
                <Bell size={24} />
                Price Drop Alerts
              </h2>
              <button
                className="price-alert-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="price-alert-content">
              {alerts.length === 0 ? (
                <div className="no-alerts">
                  <BellOff size={48} />
                  <p>No active price alerts</p>
                </div>
              ) : (
                <div className="alerts-list">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="alert-item">
                      <div className="alert-product-info">
                        <img
                          src={alert.productImage || 'https://via.placeholder.com/80'}
                          alt={alert.productName}
                          className="alert-product-image"
                        />
                        <div className="alert-details">
                          <h4>{alert.productName}</h4>
                          <p className="alert-price">
                            Tracking: ₹{alert.trackedPrice.toLocaleString()}
                          </p>
                          <p className="alert-current">
                            Current: ₹{alert.currentPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        className="alert-remove"
                        onClick={() => removeAlert(alert.id)}
                        aria-label="Remove alert"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Export function to add price alerts
export const addPriceAlert = (product) => {
  const saved = localStorage.getItem('priceDropAlerts')
  const alerts = saved ? JSON.parse(saved) : []

  if (alerts.find((a) => a.productId === product.id)) {
    toast.error('Price alert already exists for this product')
    return false
  }

  const newAlert = {
    id: Date.now().toString(),
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    trackedPrice: product.price,
    currentPrice: product.price,
    createdAt: new Date().toISOString(),
  }

  alerts.push(newAlert)
  localStorage.setItem('priceDropAlerts', JSON.stringify(alerts))
  toast.success('Price alert added! We\'ll notify you when the price drops.')
  return true
}

export default PriceDropAlerts
