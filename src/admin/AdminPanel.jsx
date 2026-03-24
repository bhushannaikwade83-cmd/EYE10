import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useSiteContent } from '../context/SiteContentContext'
import { mergeSiteContent } from '../content/defaultSiteContent'
import toast from 'react-hot-toast'
import {
  COUPON_EXPIRY_DAYS,
  getCouponByCode,
  getCouponStatus,
  redeemCoupon,
} from '../utils/googleReviews'

function AdminPanel() {
  const { content, loading, saveContent } = useSiteContent()
  const [draft, setDraft] = useState(content)
  const [saving, setSaving] = useState(false)
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [couponLookup, setCouponLookup] = useState(null)

  useEffect(() => {
    setDraft(content)
  }, [content])

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
      await saveContent(mergeSiteContent(draft))
      toast.success('Website content updated')
    } catch (error) {
      toast.error(error?.message || 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if (auth) await signOut(auth)
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

  if (loading) {
    return (
      <main>
        <div className="container" style={{ paddingTop: '160px', textAlign: 'center' }}>
          Loading admin content...
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="container" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <h1>Admin Panel</h1>
          <p style={{ color: 'var(--gray-dark)' }}>
            Edit website content and publish to Firebase Firestore.
          </p>
          <button className="btn btn-outline" onClick={handleLogout} style={{ marginTop: '12px' }}>
            Logout
          </button>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h2>Coupon Verification (Billing Counter)</h2>
          <p style={{ color: 'var(--gray-dark)' }}>
            Verify and redeem customer coupons. Coupons are valid for {COUPON_EXPIRY_DAYS} days.
          </p>

          <form onSubmit={handleVerifyCoupon} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              className="input"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              placeholder="Enter coupon code"
              style={{ minWidth: '260px' }}
            />
            <button type="submit" className="btn btn-primary">
              Verify Coupon
            </button>
          </form>

          {couponLookup && (
            <div style={{ marginTop: '14px', padding: '12px', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <p><strong>Code:</strong> {couponLookup.code}</p>
              <p><strong>Customer:</strong> {couponLookup.name}</p>
              <p><strong>Mobile:</strong> {couponLookup.phone}</p>
              <p><strong>Offer:</strong> {couponLookup.offerLabel}</p>
              <p><strong>Status:</strong> {getCouponStatus(couponLookup)}</p>
              <p><strong>Expires:</strong> {new Date(couponLookup.expiresAt).toLocaleString()}</p>
              {getCouponStatus(couponLookup) === 'valid' && (
                <button type="button" className="btn btn-secondary" onClick={handleRedeemCoupon}>
                  Redeem Now
                </button>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="card" style={{ display: 'grid', gap: '16px' }}>
          <h2>Brand</h2>
          <input className="input" value={draft.brand?.name || ''} onChange={(e) => setField('brand', 'name', e.target.value)} placeholder="Brand name" />
          <input className="input" value={draft.brand?.tagline || ''} onChange={(e) => setField('brand', 'tagline', e.target.value)} placeholder="Brand tagline" />

          <h2>Hero</h2>
          <input className="input" value={draft.hero?.badge || ''} onChange={(e) => setField('hero', 'badge', e.target.value)} placeholder="Hero badge" />
          <input className="input" value={draft.hero?.titlePrefix || ''} onChange={(e) => setField('hero', 'titlePrefix', e.target.value)} placeholder="Hero title prefix" />
          <input className="input" value={draft.hero?.titleHighlight || ''} onChange={(e) => setField('hero', 'titleHighlight', e.target.value)} placeholder="Hero title highlight" />
          <textarea className="input" rows={3} value={draft.hero?.subtitle || ''} onChange={(e) => setField('hero', 'subtitle', e.target.value)} placeholder="Hero subtitle" />

          <h2>About</h2>
          <textarea className="input" rows={2} value={draft.about?.lead || ''} onChange={(e) => setField('about', 'lead', e.target.value)} placeholder="About lead" />
          <textarea className="input" rows={4} value={draft.about?.descriptionOne || ''} onChange={(e) => setField('about', 'descriptionOne', e.target.value)} placeholder="About description" />

          <h2>CTA</h2>
          <input className="input" value={draft.cta?.heading || ''} onChange={(e) => setField('cta', 'heading', e.target.value)} placeholder="CTA heading" />
          <input className="input" value={draft.cta?.subheading || ''} onChange={(e) => setField('cta', 'subheading', e.target.value)} placeholder="CTA subheading" />

          <h2>Contact</h2>
          <input className="input" value={draft.navbar?.phone || ''} onChange={(e) => setField('navbar', 'phone', e.target.value)} placeholder="Navbar phone" />
          <input className="input" value={draft.contact?.whatsappNumber || ''} onChange={(e) => setField('contact', 'whatsappNumber', e.target.value)} placeholder="WhatsApp number (digits)" />
          <input className="input" value={draft.contact?.email || ''} onChange={(e) => setField('contact', 'email', e.target.value)} placeholder="Email" />
          <textarea className="input" rows={2} value={draft.contact?.address || ''} onChange={(e) => setField('contact', 'address', e.target.value)} placeholder="Address" />

          <h2>Footer</h2>
          <textarea className="input" rows={3} value={draft.footer?.description || ''} onChange={(e) => setField('footer', 'description', e.target.value)} placeholder="Footer description" />
          <input className="input" value={draft.footer?.phone || ''} onChange={(e) => setField('footer', 'phone', e.target.value)} placeholder="Footer phone" />
          <input className="input" value={draft.footer?.email || ''} onChange={(e) => setField('footer', 'email', e.target.value)} placeholder="Footer email" />
          <textarea className="input" rows={2} value={draft.footer?.address || ''} onChange={(e) => setField('footer', 'address', e.target.value)} placeholder="Footer address" />

          <h2>Event Banner</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={Boolean(draft.eventBanner?.enabled)}
              onChange={(e) => setBooleanField('eventBanner', 'enabled', e.target.checked)}
            />
            Enable event banner
          </label>
          <input className="input" value={draft.eventBanner?.title || ''} onChange={(e) => setField('eventBanner', 'title', e.target.value)} placeholder="Event title" />
          <input className="input" value={draft.eventBanner?.subtitle || ''} onChange={(e) => setField('eventBanner', 'subtitle', e.target.value)} placeholder="Event subtitle" />
          <input className="input" value={draft.eventBanner?.buttonText || ''} onChange={(e) => setField('eventBanner', 'buttonText', e.target.value)} placeholder="Button text" />
          <input className="input" value={draft.eventBanner?.buttonUrl || ''} onChange={(e) => setField('eventBanner', 'buttonUrl', e.target.value)} placeholder="Button URL (e.g. /products or https://...)" />
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

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default AdminPanel
