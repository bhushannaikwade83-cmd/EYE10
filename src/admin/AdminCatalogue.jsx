import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Upload } from 'lucide-react'
import { supabase } from '../supabase/client'
import { canUseAdminStorage, uploadAdminFile } from '../utils/mediaStorage'
import { mergeSiteContent } from '../content/defaultSiteContent'
import { mirrorContactToNavbarFooter } from '../utils/siteContact'
import {
  newCatalogueItemId,
  openCataloguePdfInNewTabAndDownload,
  storagePathForCatalogueItem,
  syncLegacyCatalogueFromItems,
} from '../utils/catalogue'
import { getAdminErrorMessage, logAdminError } from './adminErrorHandling'

const MAX_PDF_BYTES = 24 * 1024 * 1024

function normalizeBrand(value) {
  return String(value || '').trim().toLowerCase()
}

function cloneCatalogueRows(rows) {
  const list = Array.isArray(rows) ? rows : []
  return list.map((row) => ({
    id: row?.id != null && String(row.id).trim() ? String(row.id) : newCatalogueItemId(),
    brandName: String(row.brandName || ''),
    title: String(row.title || ''),
    pdfUrl: String(row.pdfUrl || ''),
    storagePath: String(row.storagePath || ''),
    fileName: String(row.fileName || ''),
    updatedAt: row.updatedAt || '',
  }))
}

/** Merge new rows into published list: same brand name replaces existing row but keeps existing `id` (storage path). */
function mergePublishedWithNewRows(published, additions) {
  const merged = cloneCatalogueRows(published)
  const add = cloneCatalogueRows(additions)
  for (const row of add) {
    const k = normalizeBrand(row.brandName)
    if (!k) continue
    const idx = merged.findIndex((r) => normalizeBrand(r.brandName) === k)
    if (idx >= 0) {
      merged[idx] = {
        ...row,
        id: merged[idx].id,
      }
    } else {
      merged.push(row)
    }
  }
  return merged
}

function catalogueValidationError(list) {
  const items = Array.isArray(list) ? list : []
  const seen = new Set()
  for (let i = 0; i < items.length; i++) {
    const row = items[i]
    const brand = String(row?.brandName || '').trim()
    const brandKey = normalizeBrand(brand)
    const pdf = String(row?.pdfUrl || '').trim()
    if (!brand) {
      return `Row ${i + 1}: Brand name is required.`
    }
    if (seen.has(brandKey)) {
      return `Row ${i + 1}: Brand "${brand}" is already added. Use each brand only once.`
    }
    seen.add(brandKey)
    // Link label optional when saving: storefront uses title || brandName; we backfill title on save.
    if (!pdf) {
      return `Row ${i + 1}: Upload a PDF or paste a public URL.`
    }
  }
  return null
}

export function AdminCatalogue({ draft, setDraft, saving, setSaving, saveContent }) {
  const [items, setItems] = useState([])
  const [uploadingId, setUploadingId] = useState(null)
  const [pendingUploadRowId, setPendingUploadRowId] = useState(null)
  const hiddenFileRef = useRef(null)
  const draftRef = useRef(draft)
  const itemsRef = useRef(items)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const publishedRows = cloneCatalogueRows(draft.catalogueItems).filter(
    (r) => String(r.brandName || '').trim() && String(r.pdfUrl || '').trim()
  )

  const publishedBrandKeys = new Set(publishedRows.map((r) => normalizeBrand(r.brandName)).filter(Boolean))

  const duplicateBrandIds = (() => {
    const map = new Map()
    const dupes = new Set()
    for (const row of items) {
      const key = normalizeBrand(row?.brandName)
      if (!key) continue
      const firstId = map.get(key)
      if (!firstId) {
        map.set(key, row.id)
      } else {
        dupes.add(firstId)
        dupes.add(row.id)
      }
    }
    return dupes
  })()

  const persist = async () => {
    if (items.length === 0) {
      toast.error('Add at least one new row above, then save.')
      return
    }
    const published = draftRef.current.catalogueItems || []
    const merged = mergePublishedWithNewRows(published, items).map((row) => ({
      ...row,
      title: String(row.title || '').trim() || String(row.brandName || '').trim(),
    }))
    const errMsg = catalogueValidationError(merged)
    if (errMsg) {
      toast.error(errMsg)
      return
    }
    setSaving(true)
    try {
      const base = draftRef.current
      const nextDraft = { ...base, catalogueItems: merged }
      const synced = syncLegacyCatalogueFromItems(mirrorContactToNavbarFooter(nextDraft))
      setDraft(synced)
      await saveContent(mergeSiteContent(synced))
      setItems([])
      toast.success('Catalogue updated. New rows cleared — live list is below.')
    } catch (err) {
      logAdminError('save catalogue', err)
      toast.error(getAdminErrorMessage('save catalogue'))
    } finally {
      setSaving(false)
    }
  }

  const updateItem = (id, patch) => {
    setItems((list) => {
      const next = [...list]
      const idx = next.findIndex((x) => x.id === id)
      if (idx < 0) return list
      let row = { ...next[idx], ...patch }
      if ('brandName' in patch) {
        const published = Array.isArray(draftRef.current.catalogueItems) ? draftRef.current.catalogueItems : []
        const k = normalizeBrand(patch.brandName)
        const live = published.find((r) => normalizeBrand(r?.brandName) === k)
        if (live?.id) {
          row.id = String(live.id)
        } else {
          const prevId = String(next[idx].id || '')
          const wasPublishedRow = published.some((r) => String(r.id) === prevId)
          if (wasPublishedRow) {
            row.id = newCatalogueItemId()
            if (row.pdfUrl || row.storagePath) {
              row = {
                ...row,
                pdfUrl: '',
                storagePath: '',
                fileName: '',
                updatedAt: '',
              }
            }
          }
        }
      }
      next[idx] = row
      return next
    })
  }

  const addRow = () => {
    setItems((list) => [
      ...list,
      {
        id: newCatalogueItemId(),
        brandName: '',
        title: '',
        pdfUrl: '',
        storagePath: '',
        fileName: '',
        updatedAt: '',
      },
    ])
  }

  const removeRow = (row) => {
    const ok = window.confirm(
      row.pdfUrl ? `Remove “${row.brandName || 'this brand'}” from the draft?` : 'Remove this row?'
    )
    if (!ok) return

    setItems((list) => list.filter((x) => x.id !== row.id))
    toast('Row removed from draft.', { icon: 'ℹ️' })
  }

  const runUploadForRow = async (file, row) => {
    if (!supabase) {
      toast.error('Sign in is not available.')
      return
    }
    const { data: { session } = {} } = await supabase.auth.getSession()
    if (!canUseAdminStorage() || !session?.user) {
      toast.error('Please sign in and ensure media service is available.')
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
      setItems((list) => {
        const next = [...list]
        const idx = next.findIndex((x) => x.id === row.id)
        if (idx < 0) return list
        next[idx] = {
          ...next[idx],
          pdfUrl: url,
          storagePath,
          fileName: file.name,
          updatedAt,
        }
        return next
      })
      toast.success('PDF attached. Click “Save catalogue list” to publish.')
    } catch (err) {
      logAdminError('upload catalogue PDF', err, { storagePath })
      toast.error(
        err?.code === 'storage/unauthorized'
          ? 'Upload was denied. Please verify your access permissions.'
          : getAdminErrorMessage('upload catalogue PDF')
      )
    } finally {
      setUploadingId(null)
    }
  }

  const triggerFilePick = (rowId) => {
    if (!canUseAdminStorage()) {
      toast.error('Media storage is not available in this environment.')
      return
    }
    setPendingUploadRowId(rowId)
    requestAnimationFrame(() => {
      hiddenFileRef.current?.click()
    })
  }

  const handleHiddenFileChange = (e) => {
    const file = e.target.files?.[0]
    const rowId = pendingUploadRowId
    e.target.value = ''
    setPendingUploadRowId(null)
    if (!file || !rowId) return
    const row = itemsRef.current.find((x) => x.id === rowId)
    if (row) void runUploadForRow(file, row)
  }

  const linkLabel = (row) => (row.title || '').trim() || row.brandName || 'Download'

  const storageReady = canUseAdminStorage()

  return (
    <div className="card admin-card admin-catalogue-root">
      <input
        ref={hiddenFileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="admin-catalogue-file-input-hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => void handleHiddenFileChange(e)}
      />

      <h2>Product catalogues (PDF by brand)</h2>
      <p className="admin-muted">
        Use the <strong>form at the top</strong> only to <strong>add or replace</strong> brands. What is already live on
        the site is listed <strong>below</strong> (read-only). Saving merges your new rows with that list (same brand
        name updates the existing entry). Nothing is published until you click <strong>Save catalogue list</strong>.
      </p>

      <div className="admin-actions-row" style={{ marginTop: '12px' }}>
        <button type="button" className="btn btn-primary" onClick={addRow}>
          <Plus size={18} />
          Add brand PDF
        </button>
        <button type="button" className="btn btn-outline" disabled={saving} onClick={() => void persist()}>
          {saving ? 'Saving…' : 'Save catalogue list'}
        </button>
      </div>

      <h3 className="admin-catalogue-section-title" style={{ marginTop: '28px', marginBottom: '8px', fontSize: '1.05rem' }}>
        Add new or update (form)
      </h3>
      <p className="admin-muted" style={{ marginTop: 0, marginBottom: '12px', fontSize: '0.9rem' }}>
        Starts empty each time you open this tab. Fill rows here, then save — they are <strong>not</strong> copied from
        the list below.
      </p>

      {items.length === 0 ? (
        <p className="admin-muted" style={{ marginTop: '8px' }}>
          No draft rows. Click <strong>Add brand PDF</strong> to add a new catalogue or replace a brand (use the same
          brand name as below to update its PDF).
        </p>
      ) : (
        <div className="admin-catalogue-list" style={{ marginTop: '12px', display: 'grid', gap: '16px' }}>
          {items.map((row) => {
            const bKey = normalizeBrand(row.brandName)
            const replacesLive = bKey && publishedBrandKeys.has(bKey)
            return (
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
                  <strong style={{ fontSize: '15px' }}>New / update draft</strong>
                  <button type="button" className="btn btn-outline danger-btn" onClick={() => removeRow(row)}>
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
                    required
                    autoComplete="off"
                  />
                  {duplicateBrandIds.has(row.id) ? (
                    <p className="admin-muted" style={{ marginTop: '6px', marginBottom: 0, color: '#b45309' }}>
                      Duplicate brand in this draft. Keep one row per brand.
                    </p>
                  ) : null}
                  {replacesLive ? (
                    <p className="admin-muted" style={{ marginTop: '6px', marginBottom: 0, color: '#0369a1' }}>
                      This brand is already live below — save will update that entry (same storage folder).
                    </p>
                  ) : null}
                </label>

                <label className="admin-label" style={{ marginTop: '10px', display: 'block' }}>
                  Link label (optional — uses brand name if empty)
                  <input
                    className="input"
                    style={{ width: '100%', marginTop: '6px' }}
                    value={row.title || ''}
                    onChange={(e) => updateItem(row.id, { title: e.target.value })}
                    placeholder="Shown on site; leave empty to use brand name"
                    autoComplete="off"
                  />
                </label>

                <div className="admin-catalogue-upload-row" style={{ marginTop: '12px' }}>
                  <span style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    PDF (upload or link below) *
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={uploadingId === row.id || !storageReady}
                    onClick={() => triggerFilePick(row.id)}
                  >
                    <Upload size={18} />
                    {uploadingId === row.id ? 'Uploading…' : 'Choose PDF to upload'}
                  </button>
                  <p className="admin-muted" style={{ marginTop: '10px', marginBottom: 0 }}>
                    Storage path: <code>{storagePathForCatalogueItem(row.id)}</code>
                  </p>
                  {!storageReady ? (
                    <p className="admin-muted" style={{ marginTop: '6px', marginBottom: 0, fontSize: '13px' }}>
                      Sign in and configure storage (Supabase or B2) to enable uploads.
                    </p>
                  ) : null}
                </div>

                <label className="admin-label" style={{ marginTop: '12px', display: 'block' }}>
                  Public PDF URL (if not uploading)
                  <input
                    className="input"
                    type="url"
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
                    autoComplete="off"
                  />
                </label>
                <p className="admin-muted" style={{ marginTop: '6px', marginBottom: 0, fontSize: '12px' }}>
                  Pasting a URL clears the uploaded file reference for this row. Click Save to publish.
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
                      Preview PDF — {linkLabel(row)}
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
            )
          })}
        </div>
      )}

      <hr
        style={{
          margin: '32px 0 20px',
          border: 'none',
          borderTop: '1px solid var(--border)',
        }}
      />

      <h3 className="admin-catalogue-section-title" style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.05rem' }}>
        Already on the website (live)
      </h3>
      <p className="admin-muted" style={{ marginTop: 0, marginBottom: '16px', fontSize: '0.9rem' }}>
        This list comes from saved site content — it is not editable here. Add a row above with the same brand name to
        replace a PDF or link.
      </p>

      {publishedRows.length === 0 ? (
        <p className="admin-muted">No catalogues published yet.</p>
      ) : (
        <div className="admin-catalogue-published-list" style={{ display: 'grid', gap: '12px' }}>
          {publishedRows.map((row) => (
            <div
              key={row.id}
              className="admin-catalogue-published-card"
              style={{
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px 16px',
                background: 'rgb(var(--light-rgb) / 0.55)',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 16px' }}>
                <strong>{row.brandName}</strong>
                <span className="admin-muted" style={{ fontSize: '0.95rem' }}>
                  Link label: {row.title?.trim() ? row.title : `same as brand (${row.brandName})`}
                </span>
              </div>
              {row.pdfUrl ? (
                <div style={{ marginTop: '10px' }}>
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
                    <p className="admin-muted" style={{ marginTop: '6px', marginBottom: 0, fontSize: '13px' }}>
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
