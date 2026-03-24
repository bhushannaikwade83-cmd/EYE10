import { Link } from 'react-router-dom'
import { RotateCcw, ArrowLeft } from 'lucide-react'
import './ReturnPolicy.css'

function ReturnPolicy() {
  return (
    <main>
      <div className="return-policy-page">
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            Back to Home
          </Link>

          <div className="return-policy-header">
            <RotateCcw size={48} className="return-icon" />
            <h1>Return & Refund Policy</h1>
            <p className="return-updated">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="return-policy-content">
            <section className="return-section">
              <h2>1. Return Eligibility</h2>
              <p>
                We accept returns within 30 days of purchase. To be eligible for a return, your item must:
              </p>
              <ul>
                <li>Be unused and in the same condition as received</li>
                <li>Be in the original packaging with all tags attached</li>
                <li>Include the original receipt or proof of purchase</li>
                <li>Not be damaged or altered in any way</li>
              </ul>
            </section>

            <section className="return-section">
              <h2>2. Return Process</h2>
              <p>To initiate a return:</p>
              <ol>
                <li>Contact us at info@eye10.com or call +91 99999 99999</li>
                <li>Provide your order number and reason for return</li>
                <li>Receive return authorization and instructions</li>
                <li>Ship the item to our return address</li>
                <li>Wait for inspection and processing</li>
              </ol>
            </section>

            <section className="return-section">
              <h2>3. Refund Processing</h2>
              <p>
                Once we receive and inspect your returned item, we will notify you of the approval or
                rejection of your refund. If approved, your refund will be processed within 7-14 business
                days to your original payment method.
              </p>
            </section>

            <section className="return-section">
              <h2>4. Non-Returnable Items</h2>
              <p>The following items cannot be returned:</p>
              <ul>
                <li>Custom-made or prescription lenses</li>
                <li>Items damaged by misuse or normal wear</li>
                <li>Items without proof of purchase</li>
                <li>Items returned after 30 days</li>
              </ul>
            </section>

            <section className="return-section">
              <h2>5. Exchanges</h2>
              <p>
                We currently do not offer direct exchanges. To exchange an item, please return the original
                item and place a new order for the desired product.
              </p>
            </section>

            <section className="return-section">
              <h2>6. Return Shipping</h2>
              <p>
                Return shipping costs are the responsibility of the customer unless the item was defective
                or we made an error. We recommend using a trackable shipping service for returns.
              </p>
            </section>

            <section className="return-section">
              <h2>7. Contact Us</h2>
              <p>
                For questions about returns or refunds, please contact us:
              </p>
              <p>
                <strong>Email:</strong> returns@eye10.com<br />
                <strong>Phone:</strong> +91 99999 99999<br />
                <strong>Address:</strong> 123 Main Street, City, State - 123456, India
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ReturnPolicy
