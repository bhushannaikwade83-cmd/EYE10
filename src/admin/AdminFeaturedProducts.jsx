import { mergeSiteContent } from '../content/defaultSiteContent'
import toast from 'react-hot-toast'
import { getAdminErrorMessage, logAdminError } from './adminErrorHandling'

const MAX_FEATURED = 8

export function AdminFeaturedProducts({
  draft,
  setDraft,
  saveContent,
  allProducts,
  saving,
  setSaving,
}) {
  const selected = draft.featuredProductIds || []

  const toggle = (id) => {
    setDraft((prev) => {
      const cur = [...(prev.featuredProductIds || [])]
      const idx = cur.indexOf(id)
      if (idx >= 0) {
        cur.splice(idx, 1)
      } else if (cur.length < MAX_FEATURED) {
        cur.push(id)
      } else {
        toast.error(`You can select at most ${MAX_FEATURED} products.`)
        return prev
      }
      return { ...prev, featuredProductIds: cur }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveContent(mergeSiteContent(draft))
      toast.success('Featured products saved')
    } catch (e) {
      logAdminError('save featured products', e)
      toast.error(getAdminErrorMessage('save featured products'))
    } finally {
      setSaving(false)
    }
  }

  const clearSelection = () => {
    setDraft((prev) => ({ ...prev, featuredProductIds: [] }))
  }

  const sorted = [...allProducts].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
  )

  return (
    <div className="card admin-card">
      <h2>Featured products (homepage)</h2>
      <p className="admin-muted">
        Choose up to <strong>{MAX_FEATURED}</strong> products. They appear in order listed below.
        If none are selected, the home page shows the first 8
        products automatically.
      </p>

      <p className="admin-muted" style={{ marginTop: '12px' }}>
        Selected: {selected.length} / {MAX_FEATURED}
      </p>

      <div className="admin-actions-row" style={{ marginTop: '12px' }}>
        <button type="button" className="btn btn-outline" onClick={clearSelection}>
          Clear selection
        </button>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save featured products'}
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="admin-muted" style={{ marginTop: '20px' }}>
          No products found. Add products in the admin Products section (if available).
        </p>
      ) : (
        <div className="admin-featured-list" style={{ marginTop: '20px' }}>
          {sorted.map((p) => (
            <label
              key={p.id}
              className={`admin-featured-row ${selected.includes(p.id) ? 'admin-featured-row--selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => toggle(p.id)}
              />
              <span className="admin-featured-meta">
                <strong>{p.name || 'Untitled'}</strong>
                <span className="admin-featured-id">
                  ID: {p.id}
                  {p.brand ? ` · ${p.brand}` : ''}
                  {p.category ? ` · ${p.category}` : ''}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
