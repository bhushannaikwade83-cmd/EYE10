import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAdminTabFromLocation } from './adminTabs'
import { signOut } from 'firebase/auth'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { useSiteContent } from '../context/SiteContentContext'
import { mergeSiteContent } from '../content/defaultSiteContent'
import toast from 'react-hot-toast'
import {
  COUPON_EXPIRY_DAYS,
  getCouponByCode,
  getCouponStatus,
  redeemCoupon,
} from '../utils/googleReviews'
import { AdminFeaturedProducts } from './AdminFeaturedProducts'
import { AdminHomeBanners } from './AdminHomeBanners'
import { AdminProducts } from './AdminProducts'
import { AdminDashboard } from './AdminDashboard'
import { AdminEnquiries } from './AdminEnquiries'
import { AdminOrders } from './AdminOrders'
import { AdminShell } from './AdminShell'
import { AdminCatalogue } from './AdminCatalogue'
import { AdminSocialLinks } from './AdminSocialLinks'
import { mirrorContactToNavbarFooter } from '../utils/siteContact'
import { syncLegacyCatalogueFromItems } from '../utils/catalogue'
import './AdminPanel.css'

const TAB_HEADER = {
  overview: {
    title: 'Overview',
    subtitle: 'Metrics, enquiries pipeline, and orders — plus shortcuts to every admin area.',
  },
  enquiries: { title: 'Enquiries', subtitle: 'Contact and product enquiry leads from Firestore.' },
  orders: { title: 'Orders', subtitle: 'Checkout orders, line items, and fulfilment status.' },
  content: { title: 'Website content', subtitle: 'Brand copy, hero, contact, footer, event banner.' },
  catalogue: { title: 'Catalogue PDF', subtitle: 'Upload and publish the downloadable catalogue.' },
  social: { title: 'Social links', subtitle: 'Facebook, Instagram, X, and YouTube URLs for the footer.' },
  products: { title: 'Products', subtitle: 'Full CRUD for the Firestore products collection.' },
  featured: { title: 'Featured products', subtitle: 'Homepage featured grid (up to 8).' },
  banners: { title: 'Home banners', subtitle: 'Homepage offer slider (images or video).' },
  coupons: { title: 'Coupons', subtitle: 'Google Review campaign coupon verification.' },
}

function AdminPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const { content, loading, saveContent } = useSiteContent()
  const [draft, setDraft] = useState(content)
  const [saving, setSaving] = useState(false)

  // Must depend on `location.search` (string). `useSearchParams()`'s URLSearchParams ref can fail to trigger updates.
  const tab = useMemo(() => getAdminTabFromLocation(location.search), [location.search])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [couponLookup, setCouponLookup] = useState(null)
  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    setDraft(content)
  }, [content])

  useEffect(() => {
    if (!db) {
      setAllProducts([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const q = query(collection(db, 'products'), limit(200))
        const snap = await getDocs(q)
        if (cancelled) return
        setAllProducts(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        )
      } catch (e) {
        console.warn(e)
        if (!cancelled) setAllProducts([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [db])

  const setField = (section, key, value) => {
    setDraft((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value,
      },
    }))
  }

  const setBooleanField = (section, key, checked) => {
    setField(section, key, Boolean(checked))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const synced = syncLegacyCatalogueFromItems(mirrorContactToNavbarFooter(draft))
      setDraft(synced)
      await saveContent(mergeSiteContent(synced))
      toast.success('Website content updated')
    } catch (error) {
      toast.error(error?.message || 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if (auth) await signOut(auth)
    navigate('/admin/login')
    toast.success('Logged out')
  }

  const handleVerifyCoupon = (e) => {
    e.preventDefault()
    const found = getCouponByCode(couponCodeInput)
    if (!found) {
      setCouponLookup(null)
      toast.error('Coupon not found')
      return
    }
    setCouponLookup(found)
    const status = getCouponStatus(found)
    if (status === 'valid') toast.success('Coupon is valid')
    if (status === 'expired') toast.error('Coupon is expired')
    if (status === 'redeemed') toast.error('Coupon already redeemed')
  }

  const handleRedeemCoupon = () => {
    if (!couponLookup?.code) return
    const result = redeemCoupon(couponLookup.code)
    if (!result.ok) {
      toast.error(`Cannot redeem coupon (${result.reason})`)
      return
    }
    setCouponLookup(result.coupon)
    toast.success('Coupon redeemed successfully')
  }

  const shellHeader = TAB_HEADER[tab] || TAB_HEADER.overview

  if (loading) {
    return (
      <div className="admin-panel admin-panel--loading">
        <div className="container" style={{ paddingTop: '160px', textAlign: 'center' }}>
          Loading admin content...
        </div>
      </div>
    )
  }

  return (
    <AdminShell
      title={shellHeader.title}
      subtitle={shellHeader.subtitle}
      rightSlot={
        <button type="button" className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      }
    >
      {tab === 'overview' && <AdminDashboard />}

      {tab === 'enquiries' && <AdminEnquiries />}

      {tab === 'orders' && <AdminOrders />}

      {tab === 'featured' && (
        <AdminFeaturedProducts
          draft={draft}
          setDraft={setDraft}
          saveContent={saveContent}
          allProducts={allProducts}
          saving={saving}
          setSaving={setSaving}
        />
      )}

      {tab === 'banners' && (
        <AdminHomeBanners
          draft={draft}
          setDraft={setDraft}
          saveContent={saveContent}
          saving={saving}
          setSaving={setSaving}
        />
      )}

      {tab === 'products' && <AdminProducts />}

      {tab === 'coupons' && (
          <div className="card admin-card">
            <h2>Coupon verification (billing)</h2>
            <p className="admin-muted">
              Verify and redeem customer coupons. Valid for {COUPON_EXPIRY_DAYS} days from issue.
            </p>

            <form onSubmit={handleVerifyCoupon} className="admin-coupon-form">
              <input
                className="input"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                placeholder="Enter coupon code"
              />
              <button type="submit" className="btn btn-primary">
                Verify
              </button>
            </form>

            {couponLookup && (
              <div className="admin-status-box" style={{ marginTop: '16px' }}>
                <p>
                  <strong>Code:</strong> {couponLookup.code}
                </p>
                <p>
                  <strong>Customer:</strong> {couponLookup.name}
                </p>
                <p>
                  <strong>Mobile:</strong> {couponLookup.phone}
                </p>
                <p>
                  <strong>Offer:</strong> {couponLookup.offerLabel}
                </p>
                <p>
                  <strong>Status:</strong> {getCouponStatus(couponLookup)}
                </p>
                <p>
                  <strong>Expires:</strong> {new Date(couponLookup.expiresAt).toLocaleString()}
                </p>
                {getCouponStatus(couponLookup) === 'valid' && (
                  <button type="button" className="btn btn-secondary" style={{ marginTop: '10px' }} onClick={handleRedeemCoupon}>
                    Redeem now
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'catalogue' && (
          <AdminCatalogue
            draft={draft}
            setDraft={setDraft}
            saving={saving}
            setSaving={setSaving}
            saveContent={saveContent}
          />
        )}

        {tab === 'social' && (
          <AdminSocialLinks
            draft={draft}
            setDraft={setDraft}
            saveContent={saveContent}
            saving={saving}
            setSaving={setSaving}
          />
        )}

        {tab === 'content' && (
          <form onSubmit={handleSave} className="card admin-card" style={{ display: 'grid', gap: '16px' }}>
            <h2>Brand</h2>
            <input
              className="input"
              value={draft.brand?.name || ''}
              onChange={(e) => setField('brand', 'name', e.target.value)}
              placeholder="Brand name"
            />
            <input
              className="input"
              value={draft.brand?.tagline || ''}
              onChange={(e) => setField('brand', 'tagline', e.target.value)}
              placeholder="Brand tagline"
            />

            <h2>Hero</h2>
            <input
              className="input"
              value={draft.hero?.badge || ''}
              onChange={(e) => setField('hero', 'badge', e.target.value)}
              placeholder="Hero badge"
            />
            <input
              className="input"
              value={draft.hero?.titlePrefix || ''}
              onChange={(e) => setField('hero', 'titlePrefix', e.target.value)}
              placeholder="Hero title prefix"
            />
            <input
              className="input"
              value={draft.hero?.titleHighlight || ''}
              onChange={(e) => setField('hero', 'titleHighlight', e.target.value)}
              placeholder="Hero title highlight"
            />
            <textarea
              className="input"
              rows={3}
              value={draft.hero?.subtitle || ''}
              onChange={(e) => setField('hero', 'subtitle', e.target.value)}
              placeholder="Hero subtitle"
            />

            <h2>About</h2>
            <textarea
              className="input"
              rows={2}
              value={draft.about?.lead || ''}
              onChange={(e) => setField('about', 'lead', e.target.value)}
              placeholder="About lead"
            />
            <textarea
              className="input"
              rows={4}
              value={draft.about?.descriptionOne || ''}
              onChange={(e) => setField('about', 'descriptionOne', e.target.value)}
              placeholder="About description"
            />

            <h2>CTA</h2>
            <input
              className="input"
              value={draft.cta?.heading || ''}
              onChange={(e) => setField('cta', 'heading', e.target.value)}
              placeholder="CTA heading"
            />
            <input
              className="input"
              value={draft.cta?.subheading || ''}
              onChange={(e) => setField('cta', 'subheading', e.target.value)}
              placeholder="CTA subheading"
            />

            <h2>Products (storefront copy)</h2>
            <p className="admin-muted" style={{ marginTop: 0 }}>
              Product data (name, price, images) comes from the Firestore <code>products</code> collection.
              These fields only control headings and labels on the Products page and Home featured section.
            </p>
            <input
              className="input"
              value={draft.productsPage?.title || ''}
              onChange={(e) => setField('productsPage', 'title', e.target.value)}
              placeholder="Products page title"
            />
            <input
              className="input"
              value={draft.productsPage?.subtitle || ''}
              onChange={(e) => setField('productsPage', 'subtitle', e.target.value)}
              placeholder="Products page subtitle"
            />
            <input
              className="input"
              value={draft.homeProducts?.featuredHeading || ''}
              onChange={(e) => setField('homeProducts', 'featuredHeading', e.target.value)}
              placeholder="Home — featured section heading"
            />
            <input
              className="input"
              value={draft.homeProducts?.viewAllLabel || ''}
              onChange={(e) => setField('homeProducts', 'viewAllLabel', e.target.value)}
              placeholder="Home — view all link label"
            />

            <h2>Brands section</h2>
            <p className="admin-muted" style={{ marginTop: 0 }}>
              When products in Firebase include a <code>brand</code> field, the homepage brands strip uses those
              names automatically. If none are found, the default list from site defaults is shown.
            </p>
            <input
              className="input"
              value={draft.brandsSection?.heading || ''}
              onChange={(e) => setField('brandsSection', 'heading', e.target.value)}
              placeholder="Brands section heading"
            />
            <input
              className="input"
              value={draft.brandsSection?.subtitle || ''}
              onChange={(e) => setField('brandsSection', 'subtitle', e.target.value)}
              placeholder="Brands section subtitle"
            />

            <h2>Contact details (site-wide)</h2>
            <p className="admin-muted" style={{ marginTop: 0 }}>
              One place for phone, WhatsApp, email, and address. Saving updates the navbar, footer, contact page,
              and all WhatsApp / call links together.
            </p>
            <input
              className="input"
              value={draft.contact?.phone || ''}
              onChange={(e) => setField('contact', 'phone', e.target.value)}
              placeholder="Phone (shown in navbar, footer, contact)"
            />
            <input
              className="input"
              value={draft.contact?.whatsappNumber || ''}
              onChange={(e) => setField('contact', 'whatsappNumber', e.target.value)}
              placeholder="WhatsApp number (digits only, with country code if needed)"
            />
            <input
              className="input"
              value={draft.contact?.email || ''}
              onChange={(e) => setField('contact', 'email', e.target.value)}
              placeholder="Email"
            />
            <textarea
              className="input"
              rows={3}
              value={draft.contact?.address || ''}
              onChange={(e) => setField('contact', 'address', e.target.value)}
              placeholder="Full address (navbar links, footer, contact page)"
            />

            <h2>Footer</h2>
            <p className="admin-muted" style={{ marginTop: 0 }}>
              Footer text only — phone, email, and address come from Contact details above.
            </p>
            <textarea
              className="input"
              rows={3}
              value={draft.footer?.description || ''}
              onChange={(e) => setField('footer', 'description', e.target.value)}
              placeholder="Footer description"
            />

            <h2>Event banner</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={Boolean(draft.eventBanner?.enabled)}
                onChange={(e) => setBooleanField('eventBanner', 'enabled', e.target.checked)}
              />
              Enable event banner
            </label>
            <input
              className="input"
              value={draft.eventBanner?.title || ''}
              onChange={(e) => setField('eventBanner', 'title', e.target.value)}
              placeholder="Event title"
            />
            <input
              className="input"
              value={draft.eventBanner?.subtitle || ''}
              onChange={(e) => setField('eventBanner', 'subtitle', e.target.value)}
              placeholder="Event subtitle"
            />
            <input
              className="input"
              value={draft.eventBanner?.buttonText || ''}
              onChange={(e) => setField('eventBanner', 'buttonText', e.target.value)}
              placeholder="Button text"
            />
            <input
              className="input"
              value={draft.eventBanner?.buttonUrl || ''}
              onChange={(e) => setField('eventBanner', 'buttonUrl', e.target.value)}
              placeholder="Button URL (e.g. /products or https://...)"
            />
            <label>
              Start date
              <input
                className="input"
                type="date"
                value={draft.eventBanner?.startDate || ''}
                onChange={(e) => setField('eventBanner', 'startDate', e.target.value)}
              />
            </label>
            <label>
              End date
              <input
                className="input"
                type="date"
                value={draft.eventBanner?.endDate || ''}
                onChange={(e) => setField('eventBanner', 'endDate', e.target.value)}
              />
            </label>

            <button className="btn btn-primary admin-panel-submit" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save all website content'}
            </button>
          </form>
        )}
    </AdminShell>
  )
}

export default AdminPanel
