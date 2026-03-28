import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { Package, Inbox, ShoppingBag, RefreshCw, ArrowRight } from 'lucide-react'
import { db } from '../firebase/config'
import { adminTabPath } from './adminTabs'
import './AdminDashboard.css'

function formatTs(ts) {
  if (!ts) return null
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d
  } catch {
    return null
  }
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    products: 0,
    enquiriesNew: 0,
    enquiriesTotal: 0,
    ordersPending: 0,
    ordersTotal: 0,
    revenuePending: 0,
    lastEnquiryAt: null,
    lastOrderAt: null,
  })

  const load = useCallback(async () => {
    if (!db) {
      setError('Firestore is not configured.')
      setLoading(false)
      return
    }
    setError('')
    setLoading(true)
    try {
      const [
        productsSnap,
        enquiriesTotalSnap,
        enquiriesNewSnap,
        ordersTotalSnap,
        pendingSnap,
        lastEnqSnap,
        lastOrdSnap,
      ] = await Promise.all([
        getCountFromServer(collection(db, 'products')),
        getCountFromServer(collection(db, 'enquiries')),
        getCountFromServer(query(collection(db, 'enquiries'), where('status', '==', 'new'))),
        getCountFromServer(collection(db, 'orders')),
        getDocs(query(collection(db, 'orders'), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'), limit(1))),
        getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(1))),
      ])

      let revenuePending = 0
      pendingSnap.forEach((d) => {
        revenuePending += Number(d.data()?.total) || 0
      })

      const lastEnquiryDoc = lastEnqSnap.docs[0]
      const lastOrderDoc = lastOrdSnap.docs[0]

      setStats({
        products: productsSnap.data().count,
        enquiriesNew: enquiriesNewSnap.data().count,
        enquiriesTotal: enquiriesTotalSnap.data().count,
        ordersPending: pendingSnap.size,
        ordersTotal: ordersTotalSnap.data().count,
        revenuePending,
        lastEnquiryAt: lastEnquiryDoc ? formatTs(lastEnquiryDoc.data().createdAt) : null,
        lastOrderAt: lastOrderDoc ? formatTs(lastOrderDoc.data().createdAt) : null,
      })
    } catch (e) {
      console.error(e)
      setError(e?.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const fmt = (d) => (d ? d.toLocaleString() : '—')

  return (
    <div className="admin-dashboard card admin-card">
      <div className="admin-dashboard__head">
        <div>
          <p className="admin-muted" style={{ marginBottom: 0 }}>
            Live counts from Firestore. Use the sidebar for detailed management — bookmark URLs like{' '}
            <code>/admin?tab=orders</code>.
          </p>
        </div>
        <button type="button" className="btn btn-outline admin-dashboard__refresh" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'admin-dashboard__spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? <div className="admin-status-box">{error}</div> : null}

      {loading && !error ? (
        <p className="admin-muted">Loading metrics…</p>
      ) : (
        <>
          <div className="admin-dashboard__grid">
            <Link to={adminTabPath('products')} replace className="admin-dashboard__stat">
              <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--primary">
                <Package size={22} />
              </div>
              <div className="admin-dashboard__stat-body">
                <span className="admin-dashboard__stat-value">{stats.products}</span>
                <span className="admin-dashboard__stat-label">Products in catalogue</span>
              </div>
              <ArrowRight size={18} className="admin-dashboard__stat-arrow" aria-hidden />
            </Link>

            <Link to={adminTabPath('enquiries')} replace className="admin-dashboard__stat">
              <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--warn">
                <Inbox size={22} />
              </div>
              <div className="admin-dashboard__stat-body">
                <span className="admin-dashboard__stat-value">{stats.enquiriesNew}</span>
                <span className="admin-dashboard__stat-label">
                  New enquiries ({stats.enquiriesTotal} total)
                </span>
              </div>
              <ArrowRight size={18} className="admin-dashboard__stat-arrow" aria-hidden />
            </Link>

            <Link to={adminTabPath('orders')} replace className="admin-dashboard__stat">
              <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--accent">
                <ShoppingBag size={22} />
              </div>
              <div className="admin-dashboard__stat-body">
                <span className="admin-dashboard__stat-value">{stats.ordersPending}</span>
                <span className="admin-dashboard__stat-label">
                  Pending orders ({stats.ordersTotal} total)
                </span>
              </div>
              <ArrowRight size={18} className="admin-dashboard__stat-arrow" aria-hidden />
            </Link>

            <Link to={adminTabPath('orders')} replace className="admin-dashboard__stat">
              <div className="admin-dashboard__stat-icon admin-dashboard__stat-icon--muted">
                <ShoppingBag size={22} />
              </div>
              <div className="admin-dashboard__stat-body">
                <span className="admin-dashboard__stat-value">
                  ₹{Math.round(stats.revenuePending).toLocaleString('en-IN')}
                </span>
                <span className="admin-dashboard__stat-label">Order value (pending only) — open orders</span>
              </div>
              <ArrowRight size={18} className="admin-dashboard__stat-arrow" aria-hidden />
            </Link>
          </div>

          <div className="admin-dashboard__meta">
            <p>
              <strong>Latest enquiry:</strong> {fmt(stats.lastEnquiryAt)}
            </p>
            <p>
              <strong>Latest order:</strong> {fmt(stats.lastOrderAt)}
            </p>
          </div>

          <div className="admin-dashboard__shortcuts">
            <span className="admin-muted">Quick links:</span>
            <Link to="/" className="admin-dashboard__link">
              View storefront
            </Link>
            <Link to={adminTabPath('content')} replace className="admin-dashboard__link">
              Website content
            </Link>
            <Link to={adminTabPath('catalogue')} replace className="admin-dashboard__link">
              Catalogue PDF
            </Link>
            <Link to={adminTabPath('social')} replace className="admin-dashboard__link">
              Social links
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
