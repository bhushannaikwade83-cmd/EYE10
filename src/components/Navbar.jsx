import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Phone } from 'lucide-react'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { getSitePhone, getSiteWhatsAppDigits } from '../utils/siteContact'
import { useSiteContent } from '../context/SiteContentContext'
import './Navbar.css'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { content } = useSiteContent()
  const navbarPhone = getSitePhone(content)
  const whatsappUrl = buildWhatsAppUrl(getSiteWhatsAppDigits(content))

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleAnchorClick = (e, href) => {
    if (!href.startsWith('#')) return
    e.preventDefault()
    setMenuOpen(false)

    const targetId = href.slice(1)
    const scrollToTarget = (attempt = 0) => {
      const element = document.getElementById(targetId)
      if (!element) {
        if (attempt < 20) {
          window.setTimeout(() => scrollToTarget(attempt + 1), 80)
        }
        return
      }

      const offset = 100 // account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({ top: Math.max(offsetPosition, 0), behavior: 'smooth' })
    }

    if (location.pathname !== '/') {
      navigate('/')
      window.setTimeout(() => scrollToTarget(0), 40)
      return
    }

    scrollToTarget(0)
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <a href="#main-content" className="skip-to-main">Skip to main content</a>
      <div className="navbar-bg"></div>
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <span className="logo-mark">
              <span className="logo-mark-line1">{content?.brand?.name || 'EYE10'}</span>
              <span className="logo-mark-line2">Eyewear &amp; Watches</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search eyewear & watches"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoComplete="off"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <Search size={22} strokeWidth={2.25} />
            </button>
          </form>

          <div className="nav-links">
            <Link to="/" className="nav-link" style={{ animationDelay: '0.1s' }}>Home</Link>
            <Link to="/about" className="nav-link" style={{ animationDelay: '0.15s' }}>About Us</Link>
            <Link to="/services" className="nav-link" style={{ animationDelay: '0.2s' }}>Services</Link>
            <a href="#brands" onClick={(e) => handleAnchorClick(e, '#brands')} className="nav-link" style={{ animationDelay: '0.25s' }}>Brands</a>
            <Link to="/products" className="nav-link" style={{ animationDelay: '0.3s' }}>Products</Link>
            <Link to="/contact" className="nav-link" style={{ animationDelay: '0.35s' }}>Contact</Link>
            <a href={`tel:${navbarPhone.replace(/\s+/g, '')}`} className="nav-link phone-link" style={{ animationDelay: '0.4s' }}>
              <Phone size={20} />
              {navbarPhone}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ animationDelay: '0.45s' }}
            >
              Enquire Now
            </a>
          </div>

          <button 
            className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="menu-icon-wrapper">
              <Menu size={24} className="menu-icon" />
              <X size={24} className="close-icon" />
            </span>
          </button>
        </div>

        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <form
            onSubmit={(e) => {
              handleSearch(e)
              setMenuOpen(false)
            }}
            className="mobile-search-bar"
          >
            <input
              type="search"
              enterKeyHint="search"
              placeholder="Search eyewear & watches"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
              autoComplete="off"
            />
            <button type="submit" className="mobile-search-btn" aria-label="Search">
              <Search size={22} strokeWidth={2.25} />
            </button>
          </form>
          <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-link">Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="mobile-link">About Us</Link>
          <Link to="/services" onClick={() => setMenuOpen(false)} className="mobile-link">Services</Link>
          <a href="#brands" onClick={(e) => handleAnchorClick(e, '#brands')} className="mobile-link">Brands</a>
          <Link to="/products" onClick={() => setMenuOpen(false)} className="mobile-link">Products</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="mobile-link">Contact</Link>
          <a href={`tel:${navbarPhone.replace(/\s+/g, '')}`} onClick={() => setMenuOpen(false)} className="mobile-link">Call Us</a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="btn btn-primary mobile-btn"
          >
            Enquire Now
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
