import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Gauge,
  MessageSquare,
  ShoppingBag,
  LayoutDashboard,
  FileText,
  Star,
  Image as ImageIcon,
  Package,
  Ticket,
  Menu,
  X,
  ExternalLink,
  Share2,
} from 'lucide-react'
import { adminTabPath, getAdminTabFromLocation } from './adminTabs'
import './AdminShell.css'

export function AdminShell({ title, subtitle, rightSlot, children, showNavigation = true }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdminHome = location.pathname === '/admin'
  const currentTab = useMemo(
    () => (isAdminHome ? getAdminTabFromLocation(location.search) : null),
    [isAdminHome, location.search]
  )

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.search])

  const nav = useMemo(
    () => [
      { key: 'overview', label: 'Overview', icon: Gauge },
      { key: 'enquiries', label: 'Enquiries', icon: MessageSquare },
      { key: 'orders', label: 'Orders', icon: ShoppingBag },
      { key: 'content', label: 'Website content', icon: LayoutDashboard },
      { key: 'catalogue', label: 'Catalogue PDF', icon: FileText },
      { key: 'social', label: 'Social links', icon: Share2 },
      { key: 'products', label: 'Products', icon: Package },
      { key: 'featured', label: 'Featured', icon: Star },
      { key: 'banners', label: 'Home banners', icon: ImageIcon },
      { key: 'coupons', label: 'Coupons', icon: Ticket },
    ],
    []
  )

  const navList = (
    <nav className="admin-shell__nav" aria-label="Admin navigation">
      <div className="admin-shell__brand">
        <div className="admin-shell__brand-mark">E</div>
        <div className="admin-shell__brand-text">
          <strong>EYE10 Admin</strong>
          <span>Dashboard</span>
        </div>
      </div>

      <div className="admin-shell__navlist">
        {nav.map((item) => {
          const Icon = item.icon
          const active = isAdminHome && item.key === currentTab
          return (
            <Link
              key={item.key}
              to={adminTabPath(item.key)}
              replace
              className={`admin-shell__navitem ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="admin-shell__navfooter">
        <Link to="/" className="admin-shell__navlink">
          View site <ExternalLink size={16} />
        </Link>
      </div>
    </nav>
  )

  return (
    <div className={`admin-shell ${showNavigation ? '' : 'admin-shell--no-nav'}`}>
      <header className="admin-shell__topbar">
        {showNavigation ? (
          <button
            type="button"
            className="admin-shell__iconbtn admin-shell__menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        ) : (
          <span className="admin-shell__menu" aria-hidden />
        )}

        <div className="admin-shell__title">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <div className="admin-shell__right">{rightSlot}</div>
      </header>

      <div className="admin-shell__body">
        {showNavigation ? <aside className="admin-shell__sidebar">{navList}</aside> : null}

        {showNavigation && mobileOpen ? (
          <div className="admin-shell__backdrop" onClick={() => setMobileOpen(false)}>
            <div className="admin-shell__drawer" onClick={(e) => e.stopPropagation()}>
              {navList}
            </div>
          </div>
        ) : null}

        <main className="admin-shell__content">{children}</main>
      </div>
    </div>
  )
}
