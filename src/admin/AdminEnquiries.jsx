import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { Inbox, RefreshCw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../firebase/config'
import './AdminEnquiries.css'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
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

export function AdminEnquiries() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!db) {
      setError('Firestore is not configured.')
      setLoading(false)
      return
    }
    setError('')
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'enquiries'), orderBy('createdAt', 'desc')))
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setItems(list.slice(0, LIMIT))
    } catch (e) {
      console.error(e)
      if (e?.code === 'failed-precondition') {
        setError(
          'Firestore index required for enquiries. Open the error link in the browser console to create it, or deploy firestore.indexes.json.'
        )
      } else {
        setError(e?.message || 'Failed to load enquiries')
      }
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
    return items.filter((e) => {
      const st = e.status || 'new'
      if (filter !== 'all' && st !== filter) return false
      if (!term) return true
      const blob = [e.name, e.email, e.phone, e.message, e.productName, e.productId, e.type, e.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return blob.includes(term)
    })
  }, [items, filter, search])

  const updateStatus = async (id, status) => {
    if (!db) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'enquiries', id), {
        status,
        updatedAt: serverTimestamp(),
      })
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)))
      toast.success('Status updated')
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const saveNote = async () => {
    if (!selectedId || !db) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'enquiries', selectedId), {
        adminNote: adminNote.trim(),
        updatedAt: serverTimestamp(),
      })
      setItems((prev) =>
        prev.map((x) => (x.id === selectedId ? { ...x, adminNote: adminNote.trim() } : x))
      )
      toast.success('Note saved')
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!db) return
    const ok = window.confirm('Delete this enquiry permanently?')
    if (!ok) return
    try {
      await deleteDoc(doc(db, 'enquiries', id))
      setItems((prev) => prev.filter((x) => x.id !== id))
      if (selectedId === id) setSelectedId('')
      toast.success('Deleted')
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Delete failed')
    }
  }

  return (
    <div className="card admin-card admin-enquiries">
      <div className="admin-enquiries__head">
        <div>
          <h2 style={{ marginTop: 0 }}>
            <Inbox size={22} style={{ verticalAlign: '-4px', marginRight: 8 }} />
            Enquiries
          </h2>
          <p className="admin-muted" style={{ marginBottom: 0 }}>
            Messages from the contact page and product enquiry form. Stored in Firestore{' '}
            <code>enquiries</code>.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'admin-enquiries__spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? <div className="admin-status-box">{error}</div> : null}

      <div className="admin-enquiries__toolbar">
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone, message…"
        />
        <select className="input admin-enquiries__filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-enquiries__layout">
        <div className="admin-enquiries__list">
          {loading ? (
            <p className="admin-muted">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="admin-muted">No enquiries match your filters.</p>
          ) : (
            filtered.map((e) => {
              const st = e.status || 'new'
              const active = e.id === selectedId
              return (
                <button
                  key={e.id}
                  type="button"
                  className={`admin-enquiries__row ${active ? 'active' : ''}`}
                  onClick={() => setSelectedId(e.id)}
                >
                  <div className="admin-enquiries__row-top">
                    <strong>{e.name || '—'}</strong>
                    <span className={`admin-enquiries__pill admin-enquiries__pill--${st}`}>{st}</span>
                  </div>
                  <div className="admin-enquiries__row-sub">{e.email || e.phone || '—'}</div>
                  <div className="admin-enquiries__row-meta">{formatTs(e.createdAt)}</div>
                </button>
              )
            })
          )}
        </div>

        <div className="admin-enquiries__detail">
          {!selected ? (
            <p className="admin-muted">Select an enquiry to view details.</p>
          ) : (
            <div className="admin-enquiries__detail-card">
              <div className="admin-enquiries__detail-head">
                <h3 style={{ margin: 0 }}>{selected.name || '—'}</h3>
                <div className="admin-enquiries__detail-actions">
                  <select
                    className="input"
                    value={selected.status || 'new'}
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

              <dl className="admin-enquiries__dl">
                <div>
                  <dt>Email</dt>
                  <dd>{selected.email || '—'}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selected.phone || '—'}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{selected.type || (selected.productId ? 'product' : '—')}</dd>
                </div>
                <div>
                  <dt>Product</dt>
                  <dd>
                    {selected.productName || '—'}
                    {selected.productId ? ` (ID: ${selected.productId})` : ''}
                  </dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{formatTs(selected.createdAt)}</dd>
                </div>
              </dl>

              <div className="admin-enquiries__block">
                <strong>Message</strong>
                <p className="admin-enquiries__message">{selected.message || '—'}</p>
              </div>

              <div className="admin-enquiries__block">
                <label className="admin-label" htmlFor="admin-note">
                  Internal note (not shown on site)
                </label>
                <textarea
                  id="admin-note"
                  className="input"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Call back Tuesday, sent quote…"
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
