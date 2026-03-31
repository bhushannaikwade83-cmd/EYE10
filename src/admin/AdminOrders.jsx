import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, ShoppingBag, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../supabase/client'
import { getAdminErrorMessage, getAdminInlineErrorMessage, logAdminError } from './adminErrorHandling'
import './AdminOrders.css'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const LIMIT = 200

function formatTs(ts) {
  if (!ts) return '—'
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString()
  } catch {
    return '—'
  }
}

function formatMoney(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '—'
  return `₹${Math.round(x).toLocaleString('en-IN')}`
}

export function AdminOrders() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!supabase) {
      setError(getAdminInlineErrorMessage('orders'))
      setLoading(false)
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data: rows, error } = await supabase
        .from('orders')
        .select('id, data, created_at')
        .order('created_at', { ascending: false })
        .limit(LIMIT)
      if (error) throw error
      const list = (rows || []).map((r) => ({
        id: r.id,
        ...(r.data && typeof r.data === 'object' ? r.data : {}),
        createdAt: r.created_at,
      }))
      setItems(list)
    } catch (e) {
      logAdminError('load orders', e)
      setError(getAdminInlineErrorMessage('orders'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const selected = useMemo(() => items.find((x) => x.id === selectedId) || null, [items, selectedId])

  useEffect(() => {
    if (selected) setAdminNote(selected.adminNote || '')
  }, [selected])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((o) => {
      const st = o.status || 'pending'
      if (filter !== 'all' && st !== filter) return false
      if (!term) return true
      const blob = [o.name, o.email, o.phone, o.city, o.pincode, o.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return blob.includes(term)
    })
  }, [items, filter, search])

  const updateStatus = async (id, status) => {
    if (!supabase) return
    setSaving(true)
    try {
      const cur = items.find((x) => x.id === id)
      if (!cur) return
      const { id: _i, createdAt: _c, ...rest } = cur
      const nextData = { ...rest, status, updatedAt: new Date().toISOString() }
      const { error } = await supabase.from('orders').update({ data: nextData }).eq('id', id)
      if (error) throw error
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)))
      toast.success('Order status updated')
    } catch (e) {
      logAdminError('update order status', e, { id, status })
      toast.error(getAdminErrorMessage('update order status'))
    } finally {
      setSaving(false)
    }
  }

  const saveNote = async () => {
    if (!selectedId || !supabase) return
    setSaving(true)
    try {
      const cur = items.find((x) => x.id === selectedId)
      if (!cur) return
      const { id: _i, createdAt: _c, ...rest } = cur
      const nextData = { ...rest, adminNote: adminNote.trim(), updatedAt: new Date().toISOString() }
      const { error } = await supabase.from('orders').update({ data: nextData }).eq('id', selectedId)
      if (error) throw error
      setItems((prev) =>
        prev.map((x) => (x.id === selectedId ? { ...x, adminNote: adminNote.trim() } : x))
      )
      toast.success('Note saved')
    } catch (e) {
      logAdminError('save order note', e, { selectedId })
      toast.error(getAdminErrorMessage('save order note'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!supabase) return
    const ok = window.confirm('Delete this order record permanently?')
    if (!ok) return
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id)
      if (error) throw error
      setItems((prev) => prev.filter((x) => x.id !== id))
      if (selectedId === id) setSelectedId('')
      toast.success('Deleted')
    } catch (e) {
      logAdminError('delete order', e, { id })
      toast.error(getAdminErrorMessage('delete order'))
    }
  }

  return (
    <div className="card admin-card admin-orders">
      <div className="admin-orders__head">
        <div>
          <h2 style={{ marginTop: 0 }}>
            <ShoppingBag size={22} style={{ verticalAlign: '-4px', marginRight: 8 }} />
            Orders
          </h2>
          <p className="admin-muted" style={{ marginBottom: 0 }}>
            Checkout orders from the storefront.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'admin-orders__spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? <div className="admin-status-box">{error}</div> : null}

      <div className="admin-orders__toolbar">
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone, order id…"
        />
        <select className="input admin-orders__filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-orders__layout">
        <div className="admin-orders__list">
          {loading ? (
            <p className="admin-muted">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="admin-muted">No orders match your filters.</p>
          ) : (
            filtered.map((o) => {
              const st = o.status || 'pending'
              const active = o.id === selectedId
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`admin-orders__row ${active ? 'active' : ''}`}
                  onClick={() => setSelectedId(o.id)}
                >
                  <div className="admin-orders__row-top">
                    <strong>{o.name || '—'}</strong>
                    <span className="admin-orders__total">{formatMoney(o.total)}</span>
                  </div>
                  <div className="admin-orders__row-sub">
                    {formatTs(o.createdAt)} · {o.paymentMethod || 'cod'}
                  </div>
                  <span className={`admin-orders__pill admin-orders__pill--${st}`}>{st}</span>
                </button>
              )
            })
          )}
        </div>

        <div className="admin-orders__detail">
          {!selected ? (
            <p className="admin-muted">Select an order to view line items and shipping details.</p>
          ) : (
            <div className="admin-orders__detail-card">
              <div className="admin-orders__detail-head">
                <div>
                  <h3 style={{ margin: '0 0 6px' }}>{selected.name || '—'}</h3>
                  <p className="admin-muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                    Order ID: <code>{selected.id}</code>
                  </p>
                </div>
                <div className="admin-orders__detail-actions">
                  <select
                    className="input"
                    value={selected.status || 'pending'}
                    disabled={saving}
                    onChange={(e) => void updateStatus(selected.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline danger-btn"
                    onClick={() => void handleDelete(selected.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="admin-orders__summary">
                <div>
                  <span className="admin-muted">Total</span>
                  <strong>{formatMoney(selected.total)}</strong>
                </div>
                <div>
                  <span className="admin-muted">Shipping</span>
                  <strong>{formatMoney(selected.shipping)}</strong>
                </div>
                <div>
                  <span className="admin-muted">Placed</span>
                  <strong>{formatTs(selected.createdAt)}</strong>
                </div>
              </div>

              <dl className="admin-orders__dl">
                <div>
                  <dt>Email</dt>
                  <dd>{selected.email || '—'}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selected.phone || '—'}</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>{selected.paymentMethod || '—'}</dd>
                </div>
              </dl>

              <div className="admin-orders__addr">
                <strong>Shipping address</strong>
                <p>
                  {[selected.address, selected.city, selected.state, selected.pincode]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </p>
              </div>

              <div className="admin-orders__items">
                <strong>Items</strong>
                <table className="admin-orders__table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selected.items) && selected.items.length > 0 ? (
                      selected.items.map((line, idx) => (
                        <tr key={`${line.id || idx}-${idx}`}>
                          <td>{line.name || line.id || '—'}</td>
                          <td>{line.quantity ?? '—'}</td>
                          <td>{formatMoney(line.price)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="admin-muted">
                          No line items stored on this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-orders__note-block">
                <label className="admin-label" htmlFor="order-admin-note">
                  Internal note
                </label>
                <textarea
                  id="order-admin-note"
                  className="input"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Tracking number, courier, follow-up…"
                />
                <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void saveNote()}>
                  {saving ? 'Saving…' : 'Save note'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
