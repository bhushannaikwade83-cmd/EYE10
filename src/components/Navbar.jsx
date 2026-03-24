import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Phone } from 'lucide-react'
import DarkModeToggle from './DarkModeToggle'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { useSiteContent } from '../context/SiteContentContext'
import logoImage from '../assets/eye10-logo.png'
import './Navbar.css'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { content } = useSiteContent()
  const navbarPhone = content?.navbar?.phone || '+91 99999 99999'
  const whatsappUrl = buildWhatsAppUrl(content?.contact?.whatsappNumber)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleAnchorClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        const offset = 100 // Account for fixed navbar
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
        setMenuOpen(false)
      }
    }
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <a href="#main-content" className="skip-to-main">Skip to main content</a>
      <div className="navbar-bg"></div>
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <img src={logoImage} alt="EYE10" className="logo-image" />
          </Link>

          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search glasses, sunglasses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <Search size={20} />
            </button>
          </form>

          <div className="nav-links">
            <Link to="/" className="nav-link" style={{ animationDelay: '0.1s' }}>Home</Link>
            <a href="#about" onClick={(e) => handleAnchorClick(e, '#about')} className="nav-link" style={{ animationDelay: '0.15s' }}>About Us</a>
            <a href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="nav-link" style={{ animationDelay: '0.2s' }}>Services</a>
            <a href="#brands" onClick={(e) => handleAnchorClick(e, '#brands')} className="nav-link" style={{ animationDelay: '0.25s' }}>Brands</a>
            <Link to="/products" className="nav-link" style={{ animationDelay: '0.3s' }}>Products</Link>
            <Link to="/contact" className="nav-link" style={{ animationDelay: '0.35s' }}>Contact</Link>
            <a href={`tel:${navbarPhone.replace(/\s+/g, '')}`} className="nav-link phone-link" style={{ animationDelay: '0.4s' }}>
              <Phone size={20} />
              {navbarPhone}
            </a>
            <DarkModeToggle />
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
          <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-link">Home</Link>
          <a href="#about" onClick={(e) => handleAnchorClick(e, '#about')} className="mobile-link">About Us</a>
          <a href="#services" onClick={(e) => handleAnchorClick(e, '#services')} className="mobile-link">Services</a>
          <a href="#brands" onClick={(e) => handleAnchorClick(e, '#brands')} className="mobile-link">Brands</a>
          <Link to="/products" onClick={() => setMenuOpen(false)} className="mobile-link">Products</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="mobile-link">Contact</Link>
          <a href={`tel:${navbarPhone.replace(/\s+/g, '')}`} onClick={() => setMenuOpen(false)} className="mobile-link">Call Us</a>
          <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
            <DarkModeToggle />
          </div>
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
