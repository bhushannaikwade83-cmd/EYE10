import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import './Privacy.css'

function Privacy() {
  return (
    <main>
      <div className="privacy-page">
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            Back to Home
          </Link>

          <div className="privacy-header">
            <Shield size={48} className="privacy-icon" />
            <h1>Privacy Policy</h1>
            <p className="privacy-updated">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="privacy-content">
            <section className="privacy-section">
              <h2>1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including when you:
              </p>
              <ul>
                <li>Create an account or make a purchase</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us for customer support</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p>
                The types of information we may collect include your name, email address, phone number,
                shipping address, and payment information.
              </p>
            </section>

            <section className="privacy-section">
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Send you order confirmations and updates</li>
                <li>Respond to your comments and questions</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Detect and prevent fraud</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>3. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share
                your information only in the following circumstances:
              </p>
              <ul>
                <li>With service providers who assist us in operating our website</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="privacy-section">
              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>6. Cookies</h2>
              <p>
                We use cookies and similar technologies to enhance your browsing experience, analyze
                site traffic, and personalize content. You can control cookies through your browser settings.
              </p>
            </section>

            <section className="privacy-section">
              <h2>7. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <p>
                <strong>Email:</strong> privacy@eye10.com<br />
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

export default Privacy
