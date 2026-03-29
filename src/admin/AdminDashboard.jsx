import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Inbox, ShoppingBag, RefreshCw, ArrowRight } from 'lucide-react'
import { supabase } from '../supabase/client'
import { adminTabPath } from './adminTabs'
import './AdminDashboard.css'

function formatTs(value) {
  if (!value) return null
  try {
    const d = value instanceof Date ? value : new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
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
    if (!supabase) {
      setError('Supabase is not configured.')
      setLoading(false)
      return
    }
    setError('')
    setLoading(true)
    try {
      const [
        productsRes,
        enquiriesTotalRes,
        enquiriesNewRes,
        ordersTotalRes,
        pendingRes,
        lastEnqRes,
        lastOrdRes,
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }).contains('data', { status: 'new' }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('data').contains('data', { status: 'pending' }),
        supabase.from('enquiries').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('orders').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])

      const err =
        productsRes.error ||
        enquiriesTotalRes.error ||
        enquiriesNewRes.error ||
        ordersTotalRes.error ||
        pendingRes.error ||
        lastEnqRes.error ||
        lastOrdRes.error
      if (err) throw err

      let revenuePending = 0
      for (const row of pendingRes.data || []) {
        const t = row?.data && typeof row.data === 'object' ? row.data.total : undefined
        revenuePending += Number(t) || 0
      }

      setStats({
        products: productsRes.count ?? 0,
        enquiriesNew: enquiriesNewRes.count ?? 0,
        enquiriesTotal: enquiriesTotalRes.count ?? 0,
        ordersPending: (pendingRes.data || []).length,
        ordersTotal: ordersTotalRes.count ?? 0,
        revenuePending,
        lastEnquiryAt: formatTs(lastEnqRes.data?.created_at),
        lastOrderAt: formatTs(lastOrdRes.data?.created_at),
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
            Live counts from Supabase. Use the sidebar for detailed management — bookmark URLs like{' '}
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
