import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Clock, FileDown } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoImage from '../assets/eye10-logo.png'
import { useSiteContent } from '../context/SiteContentContext'
import { getSitePhone, getSiteEmail, getSiteAddress, getStoreGoogleMapsUrl } from '../utils/siteContact'
import { getCatalogueItems } from '../utils/catalogue'
import { normalizeExternalUrl } from '../utils/socialLinks'
import './Footer.css'

const FOOTER_SOCIAL = [
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
  { key: 'twitter', icon: Twitter, label: 'X (Twitter)' },
  { key: 'youtube', icon: Youtube, label: 'YouTube' },
]

function Footer() {
  const { content } = useSiteContent()
  const navigate = useNavigate()
  const location = useLocation()
  const footerPhone = getSitePhone(content)
  const footerEmail = getSiteEmail(content)
  const footerAddress = getSiteAddress(content)
  const mapsUrl = getStoreGoogleMapsUrl(content)
  const catalogueItems = getCatalogueItems(content)
  const socialLinks = content?.socialLinks || {}
  const hasSocialLinks = FOOTER_SOCIAL.some(({ key }) => normalizeExternalUrl(socialLinks[key]))

  const goToCatalogues = (e) => {
    e.preventDefault()
    const scrollToBrands = (attempt = 0) => {
      const el = document.getElementById('brands')
      if (!el) {
        if (attempt < 20) window.setTimeout(() => scrollToBrands(attempt + 1), 80)
        return
      }
      const offset = 100
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
    }
    if (location.pathname !== '/') {
      navigate('/')
      window.setTimeout(() => scrollToBrands(0), 40)
      return
    }
    scrollToBrands(0)
  }

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
            {hasSocialLinks ? (
              <div className="social-links">
                {FOOTER_SOCIAL.map(({ key, icon: Icon, label }) => {
                  const href = normalizeExternalUrl(socialLinks[key])
                  if (!href) return null
                  return (
                    <a
                      key={key}
                      href={href}
                      className="social-link"
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon size={20} />
                    </a>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About Us</Link></li>
              {catalogueItems.length > 0 ? (
                <li>
                  <a href="/#brands" className="footer-catalogue-link" onClick={goToCatalogues}>
                    <FileDown size={16} aria-hidden />
                    Catalogues
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
              <li><Link to="/services">Eye Examination</Link></li>
              <li><Link to="/services">Frame Repair & Adjustment</Link></li>
              <li><Link to="/services">Lens Replacement</Link></li>
              <li><Link to="/services">Frame Fitting</Link></li>
              <li><Link to="/services">Warranty & Service</Link></li>
              <li><Link to="/services">Expert Consultation</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul className="footer-contact">
              <li>
                <MapPin size={18} />
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-address-link"
                    aria-label="Open shop address in Google Maps"
                  >
                    {footerAddress}
                  </a>
                ) : (
                  <span>{footerAddress}</span>
                )}
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
          <p className="footer-copyright">&copy; {new Date().getFullYear()} EYE10. All rights reserved.</p>

          <sub className="footer-credits-subtle" aria-label="Website credits">
            <span className="footer-credits-subtle__line">
              Designed by Vedant Kapse (<a href="tel:+918369813323">+91 8369813323</a>, <a href="mailto:gskcoretech@gmail.com">gskcoretech@gmail.com</a>)
            </span>
            <span className="footer-credits-subtle__line">
              Bhushan Naikwade (<a href="tel:+919773609077">+91 9773609077</a>, <a href="mailto:digitrixmedia05@gmail.com">digitrixmedia05@gmail.com</a>)
            </span>
          </sub>
        </div>
      </div>
    </footer>
  )
}

export default Footer
