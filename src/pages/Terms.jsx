import { Link } from 'react-router-dom'
import { FileText, ArrowLeft } from 'lucide-react'
import './Terms.css'

function Terms() {
  return (
    <main>
      <div className="terms-page">
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            Back to Home
          </Link>

          <div className="terms-header">
            <FileText size={48} className="terms-icon" />
            <h1>Terms & Conditions</h1>
            <p className="terms-updated">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="terms-content">
            <section className="terms-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using the EYE10 website, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please do not
                use this service.
              </p>
            </section>

            <section className="terms-section">
              <h2>2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials on EYE10's website
                for personal, non-commercial transitory viewing only. This is the grant of a license, not a
                transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2>3. Product Information</h2>
              <p>
                We strive to provide accurate product descriptions and images. However, we do not warrant
                that product descriptions or other content on this site is accurate, complete, reliable,
                current, or error-free.
              </p>
            </section>

            <section className="terms-section">
              <h2>4. Pricing</h2>
              <p>
                All prices are listed in Indian Rupees (₹) and are subject to change without notice.
                We reserve the right to modify prices at any time. Prices do not include applicable taxes
                or shipping charges unless otherwise stated.
              </p>
            </section>

            <section className="terms-section">
              <h2>5. Returns & Refunds</h2>
              <p>
                Products must be returned within 30 days of purchase in original condition with all
                packaging. Refunds will be processed within 7-14 business days after we receive and
                inspect the returned items.
              </p>
            </section>

            <section className="terms-section">
              <h2>6. Limitation of Liability</h2>
              <p>
                In no event shall EYE10 or its suppliers be liable for any damages (including, without
                limitation, damages for loss of data or profit, or due to business interruption) arising
                out of the use or inability to use the materials on EYE10's website.
              </p>
            </section>

            <section className="terms-section">
              <h2>7. Contact Information</h2>
              <p>
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> info@eye10.com<br />
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

export default Terms
