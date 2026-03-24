import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { auth, db, storage } from '../firebase/config'
import { useSiteContent } from '../context/SiteContentContext'
import { defaultSiteContent, mergeSiteContent } from '../content/defaultSiteContent'
import toast from 'react-hot-toast'
import {
  COUPON_EXPIRY_DAYS,
  getCouponByCode,
  getCouponStatus,
  redeemCoupon,
} from '../utils/googleReviews'
import { AdminFeaturedProducts } from './AdminFeaturedProducts'
import { AdminHomeBanners } from './AdminHomeBanners'
import './AdminPanel.css'

const CATALOGUE_STORAGE_PATH = 'catalogue/eye10-catalogue.pdf'
const MAX_PDF_BYTES = 24 * 1024 * 1024

function AdminPanel() {
  const { content, loading, saveContent } = useSiteContent()
  const [draft, setDraft] = useState(content)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('content')
  const [pdfUploading, setPdfUploading] = useState(false)
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
      await saveContent(mergeSiteContent(draft))
      toast.success('Website content updated')
    } catch (error) {
      toast.error(error?.message || 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCatalogueOnly = async () => {
    setSaving(true)
    try {
      await saveContent(mergeSiteContent(draft))
      toast.success('Catalogue settings saved')
    } catch (error) {
      toast.error(error?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleCatalogueFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!storage || !auth?.currentUser) {
      toast.error('Sign in and ensure Firebase Storage is enabled.')
      return
    }
    if (file.type !== 'application/pdf') {
      toast.error('Please choose a PDF file.')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error('PDF must be under 25 MB.')
      return
    }
    setPdfUploading(true)
    try {
      const storageRef = ref(storage, CATALOGUE_STORAGE_PATH)
      await uploadBytes(storageRef, file, { contentType: 'application/pdf' })
      const url = await getDownloadURL(storageRef)
      const nextCatalogue = {
        ...(draft.catalogue || {}),
        pdfUrl: url,
        storagePath: CATALOGUE_STORAGE_PATH,
        fileName: file.name,
        updatedAt: new Date().toISOString(),
      }
      const merged = mergeSiteContent({ ...draft, catalogue: nextCatalogue })
      await saveContent(merged)
      setDraft(merged)
      toast.success('Catalogue PDF uploaded and published.')
    } catch (err) {
      console.error(err)
      toast.error(
        err?.code === 'storage/unauthorized'
          ? 'Upload denied: deploy storage.rules from the repo and ensure your user is in Firestore admins/{uid}.'
          : err?.message || 'Upload failed.'
      )
    } finally {
      setPdfUploading(false)
    }
  }

  const handleRemoveCatalogue = async () => {
    if (!storage) {
      toast.error('Firebase Storage is not available.')
      return
    }
    const path = (draft.catalogue?.storagePath || '').trim()
    if (path) {
      try {
        await deleteObject(ref(storage, path))
      } catch (err) {
        console.warn(err)
      }
    }
    const merged = mergeSiteContent({
      ...draft,
      catalogue: {
        ...defaultSiteContent.catalogue,
        title: draft.catalogue?.title || defaultSiteContent.catalogue.title,
      },
    })
    try {
      await saveContent(merged)
      setDraft(merged)
      toast.success('Catalogue removed from the website.')
    } catch (error) {
      toast.error(error?.message || 'Failed to update')
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

  const cat = draft.catalogue || defaultSiteContent.catalogue
  const hasLivePdf = Boolean((cat.pdfUrl || '').trim())

  if (loading) {
    return (
      <main className="admin-panel">
        <div className="container" style={{ paddingTop: '160px', textAlign: 'center' }}>
          Loading admin content...
        </div>
      </main>
    )
  }

  return (
    <main className="admin-panel">
      <div className="container">
        <div className="card admin-panel-header">
          <div>
            <h1 style={{ marginBottom: '8px' }}>Admin Panel</h1>
            <p className="admin-muted" style={{ margin: 0 }}>
              Manage site copy, catalogue PDF, featured products, home banners, and coupon verification.
              Changes publish to Firestore.
            </p>
          </div>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'content'}
            className={`admin-tab ${tab === 'content' ? 'active' : ''}`}
            onClick={() => setTab('content')}
          >
            Website content
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'catalogue'}
            className={`admin-tab ${tab === 'catalogue' ? 'active' : ''}`}
            onClick={() => setTab('catalogue')}
          >
            Catalogue PDF
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'featured'}
            className={`admin-tab ${tab === 'featured' ? 'active' : ''}`}
            onClick={() => setTab('featured')}
          >
            Featured
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'banners'}
            className={`admin-tab ${tab === 'banners' ? 'active' : ''}`}
            onClick={() => setTab('banners')}
          >
            Home banners
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'coupons'}
            className={`admin-tab ${tab === 'coupons' ? 'active' : ''}`}
            onClick={() => setTab('coupons')}
          >
            Coupons
          </button>
        </div>

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
          <div className="card admin-card">
            <h2>Product catalogue (PDF)</h2>
            <p className="admin-muted">
              Upload a PDF to Firebase Storage (public download). Shoppers see it on Brands, Products, and
              the footer. Deploy <code>storage.rules</code> from this repo (see Firebase Console or{' '}
              <code>npm run firebase:deploy:storage</code>).
            </p>

            <div style={{ display: 'block', marginTop: '16px' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Button label (site)</span>
              <input
                className="input"
                style={{ width: '100%' }}
                value={cat.title || ''}
                onChange={(e) => setField('catalogue', 'title', e.target.value)}
                placeholder="e.g. Download catalogue"
              />
            </div>

            <div className="admin-catalogue-drop" style={{ marginTop: '16px' }}>
              <p style={{ marginBottom: '12px', fontWeight: 600 }}>Upload PDF (replaces previous file)</p>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="admin-catalogue-file"
                disabled={pdfUploading || !storage}
                onChange={handleCatalogueFile}
              />
              <p className="admin-muted" style={{ marginTop: '10px', marginBottom: 0 }}>
                {pdfUploading ? 'Uploading…' : 'Max 25 MB. Stored at catalogue/eye10-catalogue.pdf'}
              </p>
            </div>

            <div style={{ marginTop: '8px' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Or paste a public PDF URL (optional)
              </span>
              <input
                className="input"
                style={{ width: '100%' }}
                value={cat.pdfUrl || ''}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    catalogue: {
                      ...(prev.catalogue || {}),
                      pdfUrl: e.target.value,
                      storagePath: '',
                    },
                  }))
                }
                placeholder="https://…"
              />
              <p className="admin-muted" style={{ marginTop: '8px' }}>
                Editing this clears the storage path reference; upload again to host the file on Firebase.
              </p>
            </div>

            <div className="admin-actions-row">
              <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSaveCatalogueOnly}>
                Save catalogue settings
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={!hasLivePdf}
                onClick={() => void handleRemoveCatalogue()}
              >
                Remove PDF from site
              </button>
            </div>

            {hasLivePdf && (
              <div className="admin-status-box">
                <strong>Live link</strong>
                <div style={{ marginTop: '8px' }}>
                  <a href={cat.pdfUrl} target="_blank" rel="noopener noreferrer">
                    Open PDF
                  </a>
                </div>
                {cat.fileName ? (
                  <p style={{ marginTop: '8px', marginBottom: 0 }}>
                    File: {cat.fileName}
                    {cat.updatedAt ? ` · Updated ${new Date(cat.updatedAt).toLocaleString()}` : ''}
                  </p>
                ) : null}
                {cat.storagePath ? (
                  <p style={{ marginTop: '6px', marginBottom: 0, fontSize: '12px', opacity: 0.85 }}>
                    Storage: {cat.storagePath}
                  </p>
                ) : null}
              </div>
            )}
          </div>
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

            <h2>Contact</h2>
            <input
              className="input"
              value={draft.navbar?.phone || ''}
              onChange={(e) => setField('navbar', 'phone', e.target.value)}
              placeholder="Navbar phone"
            />
            <input
              className="input"
              value={draft.contact?.whatsappNumber || ''}
              onChange={(e) => setField('contact', 'whatsappNumber', e.target.value)}
              placeholder="WhatsApp number (digits)"
            />
            <input
              className="input"
              value={draft.contact?.email || ''}
              onChange={(e) => setField('contact', 'email', e.target.value)}
              placeholder="Email"
            />
            <textarea
              className="input"
              rows={2}
              value={draft.contact?.address || ''}
              onChange={(e) => setField('contact', 'address', e.target.value)}
              placeholder="Address"
            />

            <h2>Footer</h2>
            <textarea
              className="input"
              rows={3}
              value={draft.footer?.description || ''}
              onChange={(e) => setField('footer', 'description', e.target.value)}
              placeholder="Footer description"
            />
            <input
              className="input"
              value={draft.footer?.phone || ''}
              onChange={(e) => setField('footer', 'phone', e.target.value)}
              placeholder="Footer phone"
            />
            <input
              className="input"
              value={draft.footer?.email || ''}
              onChange={(e) => setField('footer', 'email', e.target.value)}
              placeholder="Footer email"
            />
            <textarea
              className="input"
              rows={2}
              value={draft.footer?.address || ''}
              onChange={(e) => setField('footer', 'address', e.target.value)}
              placeholder="Footer address"
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
      </div>
    </main>
  )
}

export default AdminPanel
