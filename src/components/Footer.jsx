import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Clock, FileDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import logoImage from '../assets/eye10-logo.png'
import { useSiteContent } from '../context/SiteContentContext'
import './Footer.css'

function Footer() {
  const { content } = useSiteContent()
  const footerPhone = content?.footer?.phone || '+91 99999 99999'
  const footerEmail = content?.footer?.email || 'info@eye10.com'
  const footerAddress = content?.footer?.address || '123 Main Street, City, State - 123456, India'
  const catalogueUrl = (content?.catalogue?.pdfUrl || '').trim()
  const catalogueLabel = (content?.catalogue?.title || 'Product catalogue').trim() || 'Product catalogue'

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img src={logoImage} alt="EYE10" className="footer-logo-image" />
              <p>{content?.brand?.tagline}</p>
            </div>
            <p className="footer-description">
              {content?.footer?.description}
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="#about">About Us</a></li>
              {catalogueUrl ? (
                <li>
                  <a href={catalogueUrl} target="_blank" rel="noopener noreferrer" className="footer-catalogue-link">
                    <FileDown size={16} aria-hidden />
                    {catalogueLabel}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul className="footer-links">
              <li><a href="#services">Eye Examination</a></li>
              <li><a href="#services">Frame Repair & Adjustment</a></li>
              <li><a href="#services">Lens Replacement</a></li>
              <li><a href="#services">Frame Fitting</a></li>
              <li><a href="#services">Warranty & Service</a></li>
              <li><a href="#services">Expert Consultation</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul className="footer-contact">
              <li>
                <MapPin size={18} />
                <span>{footerAddress}</span>
              </li>
              <li>
                <Phone size={18} />
                <a href={`tel:${footerPhone.replace(/\s+/g, '')}`}>{footerPhone}</a>
              </li>
              <li>
                <Mail size={18} />
                <a href={`mailto:${footerEmail}`}>{footerEmail}</a>
              </li>
              <li>
                <Clock size={18} />
                <span>Mon-Sat: 10 AM - 8 PM<br />Sun: 11 AM - 6 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} EYE10. All rights reserved.</p>
          <p>Designed with ❤️ for premium eyewear</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
