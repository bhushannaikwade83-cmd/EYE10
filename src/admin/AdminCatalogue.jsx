import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '../supabase/client'
import { canUseAdminStorage, deleteAdminFile, uploadAdminFile } from '../utils/mediaStorage'
import { mergeSiteContent } from '../content/defaultSiteContent'
import { mirrorContactToNavbarFooter } from '../utils/siteContact'
import {
  newCatalogueItemId,
  openCataloguePdfInNewTabAndDownload,
  storagePathForCatalogueItem,
  syncLegacyCatalogueFromItems,
} from '../utils/catalogue'

const MAX_PDF_BYTES = 24 * 1024 * 1024

export function AdminCatalogue({ draft, setDraft, saving, setSaving, saveContent }) {
  const [uploadingId, setUploadingId] = useState(null)

  const items = Array.isArray(draft.catalogueItems) ? draft.catalogueItems : []

  const persist = async (nextDraft) => {
    setSaving(true)
    try {
      const synced = syncLegacyCatalogueFromItems(mirrorContactToNavbarFooter(nextDraft))
      setDraft(synced)
      await saveContent(mergeSiteContent(synced))
      toast.success('Catalogue saved')
    } catch (err) {
      toast.error(err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const updateItem = (id, patch) => {
    setDraft((prev) => {
      const list = Array.isArray(prev.catalogueItems) ? [...prev.catalogueItems] : []
      const idx = list.findIndex((x) => x.id === id)
      if (idx < 0) return prev
      list[idx] = { ...list[idx], ...patch }
      return { ...prev, catalogueItems: list }
    })
  }

  const addRow = () => {
    setDraft((prev) => ({
      ...prev,
      catalogueItems: [
        ...(Array.isArray(prev.catalogueItems) ? prev.catalogueItems : []),
        {
          id: newCatalogueItemId(),
          brandName: '',
          title: '',
          pdfUrl: '',
          storagePath: '',
          fileName: '',
          updatedAt: '',
        },
      ],
    }))
  }

  const removeRow = async (row) => {
    const ok = window.confirm(
      row.pdfUrl ? `Remove “${row.brandName || 'this brand'}” and its PDF from the site?` : 'Remove this row?'
    )
    if (!ok) return

    if (row.storagePath && canUseAdminStorage()) {
      try {
        await deleteAdminFile(row.storagePath)
      } catch (e) {
        console.warn(e)
      }
    }

    const nextItems = items.filter((x) => x.id !== row.id)
    const nextDraft = { ...draft, catalogueItems: nextItems }
    setDraft(nextDraft)
    await persist(nextDraft)
  }

  const handleUpload = async (e, row) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const { data: { session } = {} } = await supabase.auth.getSession()
    if (!canUseAdminStorage() || !session?.user) {
      toast.error('Sign in and configure storage (Supabase Storage or B2 — see .env.example).')
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
    if (!String(row.brandName || '').trim()) {
      toast.error('Enter a brand name before uploading.')
      return
    }

    const storagePath = storagePathForCatalogueItem(row.id)
    setUploadingId(row.id)
    try {
      const { url } = await uploadAdminFile({
        storagePath,
        file,
        contentType: 'application/pdf',
      })
      const updatedAt = new Date().toISOString()
      const list = items.map((x) =>
        x.id === row.id
          ? {
              ...x,
              pdfUrl: url,
              storagePath,
              fileName: file.name,
              updatedAt,
            }
          : x
      )
      const nextDraft = { ...draft, catalogueItems: list }
      setDraft(nextDraft)
      await persist(nextDraft)
      toast.success('PDF uploaded')
    } catch (err) {
      console.error(err)
      toast.error(
        err?.code === 'storage/unauthorized'
          ? 'Upload denied: check Storage policies and that your user is in table public.admins.'
          : err?.message || 'Upload failed.'
      )
    } finally {
      setUploadingId(null)
    }
  }

  const handleSaveMeta = async () => {
    await persist(draft)
  }

  const linkLabel = (row) => (row.title || '').trim() || row.brandName || 'Download'

  return (
    <div className="card admin-card">
      <h2>Product catalogues (PDF by brand)</h2>
      <p className="admin-muted">
        Add one row per brand. Shoppers see each link on Brands, Products, and the footer. Files upload to{' '}
        <code>catalogue/brands/…</code> (Supabase Storage or Backblaze B2 when <code>VITE_STORAGE_BACKEND=b2</code>;
        max 25 MB).
      </p>

      <div className="admin-actions-row" style={{ marginTop: '12px' }}>
        <button type="button" className="btn btn-primary" onClick={addRow}>
          <Plus size={18} />
          Add brand PDF
        </button>
        <button type="button" className="btn btn-outline" disabled={saving} onClick={() => void handleSaveMeta()}>
          {saving ? 'Saving…' : 'Save catalogue list'}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="admin-muted" style={{ marginTop: '20px' }}>
          No brand PDFs yet. Click &quot;Add brand PDF&quot; — legacy single PDF is loaded automatically if it exists in
          site content.
        </p>
      ) : (
        <div className="admin-catalogue-list" style={{ marginTop: '20px', display: 'grid', gap: '16px' }}>
          {items.map((row) => (
            <div
              key={row.id}
              className="admin-catalogue-card"
              style={{
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '16px',
                background: 'rgb(var(--light-rgb) / 0.35)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <strong style={{ fontSize: '15px' }}>Brand catalogue</strong>
                <button type="button" className="btn btn-outline danger-btn" onClick={() => void removeRow(row)}>
                  <Trash2 size={18} />
                  Remove
                </button>
              </div>

              <label className="admin-label" style={{ marginTop: '12px', display: 'block' }}>
                Brand name *
                <input
                  className="input"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={row.brandName || ''}
                  onChange={(e) => updateItem(row.id, { brandName: e.target.value })}
                  placeholder="e.g. Ray-Ban, Oakley"
                />
              </label>

              <label className="admin-label" style={{ marginTop: '10px', display: 'block' }}>
                Link label (optional)
                <input
                  className="input"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={row.title || ''}
                  onChange={(e) => updateItem(row.id, { title: e.target.value })}
                  placeholder="Shown on site; defaults to brand name"
                />
              </label>

              <div style={{ marginTop: '12px' }}>
                <span style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Upload PDF</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={uploadingId === row.id || !canUseAdminStorage()}
                  onChange={(e) => void handleUpload(e, row)}
                />
                <p className="admin-muted" style={{ marginTop: '10px', marginBottom: 0 }}>
                  {uploadingId === row.id ? 'Uploading…' : `Path: ${storagePathForCatalogueItem(row.id)}`}
                </p>
              </div>

              <label className="admin-label" style={{ marginTop: '12px', display: 'block' }}>
                Or paste public PDF URL
                <input
                  className="input"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={row.pdfUrl || ''}
                  onChange={(e) => {
                    const raw = e.target.value
                    const v = raw.trim()
                    updateItem(row.id, {
                      pdfUrl: raw,
                      ...(v
                        ? { storagePath: '', fileName: 'External URL', updatedAt: new Date().toISOString() }
                        : { storagePath: '', fileName: '', updatedAt: '' }),
                    })
                  }}
                  placeholder="https://…"
                />
              </label>
              <p className="admin-muted" style={{ marginTop: '6px', marginBottom: 0, fontSize: '12px' }}>
                Pasting a URL clears the storage file reference for this row.
              </p>

              {row.pdfUrl ? (
                <div className="admin-status-box" style={{ marginTop: '12px' }}>
                  <a
                    href={row.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault()
                      void openCataloguePdfInNewTabAndDownload(row)
                    }}
                  >
                    Open PDF — {linkLabel(row)}
                  </a>
                  {row.fileName ? (
                    <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '13px' }}>
                      {row.fileName}
                      {row.updatedAt ? ` · ${new Date(row.updatedAt).toLocaleString()}` : ''}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
