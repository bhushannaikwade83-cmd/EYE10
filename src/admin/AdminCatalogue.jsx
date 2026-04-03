import { useRef, useState } from 'react'
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

function catalogueValidationError(items) {
  const list = Array.isArray(items) ? items : []
  for (let i = 0; i < list.length; i++) {
    const row = list[i]
    const brand = String(row?.brandName || '').trim()
    const title = String(row?.title || '').trim()
    const pdf = String(row?.pdfUrl || '').trim()
    if (!brand) {
      return `Row ${i + 1}: Brand name is required.`
    }
    if (!title) {
      return `Row ${i + 1}: Link label is required.`
    }
    if (!pdf) {
      return `Row ${i + 1}: Upload a PDF or paste a public URL.`
    }
  }
  return null
}

export function AdminCatalogue({ draft, setDraft, saving, setSaving, saveContent }) {
  const [uploadingId, setUploadingId] = useState(null)
  const [pendingUploadRowId, setPendingUploadRowId] = useState(null)
  const hiddenFileRef = useRef(null)

  const items = Array.isArray(draft.catalogueItems) ? draft.catalogueItems : []

  const persist = async (nextDraft) => {
    const errMsg = catalogueValidationError(nextDraft.catalogueItems)
    if (errMsg) {
      toast.error(errMsg)
      return
    }
    setSaving(true)
    try {
      const synced = syncLegacyCatalogueFromItems(mirrorContactToNavbarFooter(nextDraft))
      setDraft(synced)
      await saveContent(mergeSiteContent(synced))
      toast.success('Catalogue saved')
    } catch (err) {
      logAdminError('save catalogue', err)
      toast.error(getAdminErrorMessage('save catalogue'))
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

  const removeRow = (row) => {
    const ok = window.confirm(
      row.pdfUrl ? `Remove “${row.brandName || 'this brand'}” from the list?` : 'Remove this row?'
    )
    if (!ok) return

    setDraft((prev) => {
      const list = Array.isArray(prev.catalogueItems) ? prev.catalogueItems.filter((x) => x.id !== row.id) : []
      return { ...prev, catalogueItems: list }
    })
    toast('Row removed from draft. Click Save catalogue list to publish.', { icon: 'ℹ️' })
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
    if (!String(row.title || '').trim()) {
      toast.error('Enter a link label before uploading.')
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
      setDraft((prev) => {
        const list = Array.isArray(prev.catalogueItems) ? [...prev.catalogueItems] : []
        const idx = list.findIndex((x) => x.id === row.id)
        if (idx < 0) return prev
        list[idx] = {
          ...list[idx],
          pdfUrl: url,
          storagePath,
          fileName: file.name,
          updatedAt,
        }
        return { ...prev, catalogueItems: list }
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
    const row = items.find((x) => x.id === rowId)
    if (row) void runUploadForRow(file, row)
  }

  const handleSaveMeta = () => {
    void persist(draft)
  }

  const linkLabel = (row) => (row.title || '').trim() || row.brandName || 'Download'

  const storageReady = canUseAdminStorage()

  return (
    <div className="card admin-card">
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
        Add one row per brand. Shoppers see each link on Brands, Products, and the footer. Files upload to{' '}
        <code>catalogue/brands/…</code> (max 25 MB). All fields are required; nothing is saved until you click{' '}
        <strong>Save catalogue list</strong>.
      </p>

      <div className="admin-actions-row" style={{ marginTop: '12px' }}>
        <button type="button" className="btn btn-primary" onClick={addRow}>
          <Plus size={18} />
          Add brand PDF
        </button>
        <button type="button" className="btn btn-outline" disabled={saving} onClick={handleSaveMeta}>
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
              </label>

              <label className="admin-label" style={{ marginTop: '10px', display: 'block' }}>
                Link label *
                <input
                  className="input"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={row.title || ''}
                  onChange={(e) => updateItem(row.id, { title: e.target.value })}
                  placeholder="Text shown for the download link"
                  required
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
                Pasting a URL clears the uploaded file reference for this row. You still must click Save to publish.
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
