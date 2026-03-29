import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Clock, FileDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import logoImage from '../assets/eye10-logo.png'
import { useSiteContent } from '../context/SiteContentContext'
import { getSitePhone, getSiteEmail, getSiteAddress, getStoreGoogleMapsUrl } from '../utils/siteContact'
import { getCatalogueItems, openCataloguePdfInNewTabAndDownload } from '../utils/catalogue'
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
  const footerPhone = getSitePhone(content)
  const footerEmail = getSiteEmail(content)
  const footerAddress = getSiteAddress(content)
  const mapsUrl = getStoreGoogleMapsUrl(content)
  const catalogueItems = getCatalogueItems(content)
  const socialLinks = content?.socialLinks || {}
  const hasSocialLinks = FOOTER_SOCIAL.some(({ key }) => normalizeExternalUrl(socialLinks[key]))

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
              {catalogueItems.map((item) => {
                const label = ((item.title || item.brandName || 'Catalogue').trim() || 'Catalogue') + ' (PDF)'
                return (
                  <li key={item.id}>
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-catalogue-link"
                      onClick={(e) => {
                        e.preventDefault()
                        void openCataloguePdfInNewTabAndDownload(item)
                      }}
                    >
                      <FileDown size={16} aria-hidden />
                      {label}
                    </a>
                  </li>
                )
              })}
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

          <div className="footer-credits-zone">
            <span className="footer-credits-zone__orb footer-credits-zone__orb--a" aria-hidden />
            <span className="footer-credits-zone__orb footer-credits-zone__orb--b" aria-hidden />
            <span className="footer-credits-zone__shine" aria-hidden />
            <div className="footer-credits" aria-label="Website credits">
              <p className="footer-credits__intro">Designed with love for premium eyewear</p>
              <div className="footer-credits__grid">
                <article className="footer-credits-card">
                  <h3 className="footer-credits-card__name">Vedant Kapse</h3>
                  <p className="footer-credits-card__meta">
                    <span className="footer-credits-card__label">Contact</span>
                    <a href="tel:+917208324505">72083 24505</a>
                  </p>
                  <p className="footer-credits-card__meta">
                    <span className="footer-credits-card__label">Email</span>
                    <a href="mailto:vedantkapse901@gmail.com">vedantkapse901@gmail.com</a>
                  </p>
                </article>
                <article className="footer-credits-card">
                  <h3 className="footer-credits-card__name">Bhushan Naikwade</h3>
                  <p className="footer-credits-card__meta">
                    <span className="footer-credits-card__label">Contact</span>
                    <a href="tel:+919773609077">97736 09077</a>
                  </p>
                  <p className="footer-credits-card__meta">
                    <span className="footer-credits-card__label">Email</span>
                    <a href="mailto:digitrixmedia05@gmail.com">digitrixmedia05@gmail.com</a>
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
