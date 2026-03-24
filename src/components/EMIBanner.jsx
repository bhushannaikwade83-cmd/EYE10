import { CreditCard, CheckCircle } from 'lucide-react'
import './EMIBanner.css'

function EMIBanner() {
  return (
    <section className="emi-banner">
      <div className="container">
        <div className="emi-content">
          <div className="emi-icon-wrapper">
            <CreditCard size={48} className="emi-icon" />
          </div>
          <div className="emi-text">
            <h3>Easy EMI Options Available</h3>
            <p>Flexible payment plans starting from ₹500/month. No hidden charges. Instant approval.</p>
            <div className="emi-features">
              <div className="emi-feature">
                <CheckCircle size={20} />
                <span>0% Interest Options</span>
              </div>
              <div className="emi-feature">
                <CheckCircle size={20} />
                <span>Instant Approval</span>
              </div>
              <div className="emi-feature">
                <CheckCircle size={20} />
                <span>Multiple Banks</span>
              </div>
            </div>
          </div>
          <a href="/contact" className="emi-cta">
            Know More
          </a>
        </div>
      </div>
    </section>
  )
}

export default EMIBanner
