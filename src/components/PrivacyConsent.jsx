import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'
import './PrivacyConsent.css'

function PrivacyConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('privacyConsent')
    if (!consent) {
      setTimeout(() => setShowConsent(true), 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('privacyConsent', 'accepted')
    setShowConsent(false)
  }

  const handleDecline = () => {
    localStorage.setItem('privacyConsent', 'declined')
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="privacy-consent">
      <div className="privacy-content">
        <div className="privacy-icon">
          <Cookie size={32} />
        </div>
        <div className="privacy-text">
          <h3>Privacy Notice</h3>
          <p>
            This website uses local storage to enhance your browsing experience and provide
            personalized content. By continuing to use this site, you consent to our privacy policy.
          </p>
        </div>
        <div className="privacy-actions">
          <button onClick={handleAccept} className="btn-accept">
            Accept All
          </button>
          <button onClick={handleDecline} className="btn-decline">
            Decline
          </button>
          <button onClick={handleAccept} className="btn-close" aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacyConsent
