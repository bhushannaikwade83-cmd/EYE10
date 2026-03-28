/** PDF catalogues with per–brand labels (site content). */

export function newCatalogueItemId() {
  return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function storagePathForCatalogueItem(itemId) {
  const safe = String(itemId || 'item').replace(/[^a-zA-Z0-9_-]/g, '_')
  return `catalogue/brands/${safe}/catalogue.pdf`
}

/**
 * Normalized list for the storefront: prefers `catalogueItems`, falls back to legacy single `catalogue`.
 */
export function getCatalogueItems(content) {
  const items = content?.catalogueItems
  if (Array.isArray(items) && items.length > 0) {
    return items
      .map((row) => ({
        id: String(row.id || ''),
        brandName: String(row.brandName || '').trim(),
        title: String(row.title || '').trim(),
        pdfUrl: String(row.pdfUrl || '').trim(),
        storagePath: String(row.storagePath || '').trim(),
        fileName: String(row.fileName || '').trim(),
        updatedAt: row.updatedAt || '',
      }))
      .filter((row) => row.brandName && row.pdfUrl)
  }
  const c = content?.catalogue
  if (c && String(c.pdfUrl || '').trim()) {
    return [
      {
        id: 'legacy',
        brandName: String(c.brandName || 'Catalogue').trim() || 'Catalogue',
        title: String(c.title || 'Download catalogue').trim() || 'Download catalogue',
        pdfUrl: String(c.pdfUrl).trim(),
        storagePath: String(c.storagePath || '').trim(),
        fileName: String(c.fileName || '').trim(),
        updatedAt: c.updatedAt || '',
      },
    ]
  }
  return []
}

/** First PDF URL for simple “primary” link fallbacks. */
export function getPrimaryCataloguePdfUrl(content) {
  const list = getCatalogueItems(content)
  return list[0]?.pdfUrl || ''
}

/**
 * PDF for a product brand name: exact case-insensitive match on `brandName`.
 * If there is only one catalogue row, use it when there is no name match (legacy single-PDF behaviour).
 */
export function getCataloguePdfUrlForBrand(content, brandName) {
  const item = getCatalogueItemForBrand(content, brandName)
  return item?.pdfUrl || ''
}

/** Resolved row for a product brand, or the only catalogue row when there is just one. */
export function getCatalogueItemForBrand(content, brandName) {
  const items = getCatalogueItems(content)
  if (!items.length) return null
  const b = String(brandName || '').trim().toLowerCase()
  const match = items.find((i) => String(i.brandName || '').trim().toLowerCase() === b)
  if (match) return match
  if (items.length === 1) return items[0]
  return null
}

/** Safe filename for Save dialog when downloading a catalogue row. */
export function suggestedCatalogueDownloadFilename(item) {
  const fn = String(item?.fileName || '').trim()
  if (fn.toLowerCase().endsWith('.pdf')) return fn
  const base = String(item?.brandName || item?.title || 'catalogue')
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '-')
    .slice(0, 80)
  return `${base || 'catalogue'}.pdf`
}

/**
 * Opens the PDF in a new tab and starts a download (best-effort; if fetch is blocked by CORS, the tab view still works).
 */
export async function openCataloguePdfInNewTabAndDownload(item) {
  const url = String(item?.pdfUrl || '').trim()
  if (!url) return
  const name = suggestedCatalogueDownloadFilename(item)
  window.open(url, '_blank', 'noopener,noreferrer')
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = name
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    // Public Storage URLs sometimes omit CORS for fetch; viewing in the new tab is enough.
  }
}

/**
 * Keep legacy `catalogue` in sync with the first item that has a PDF (older code / Firestore).
 */
export function syncLegacyCatalogueFromItems(draft) {
  const items = Array.isArray(draft.catalogueItems) ? draft.catalogueItems : []
  const first = items.find((i) => String(i?.pdfUrl || '').trim())
  if (!first) {
    return {
      ...draft,
      catalogue: {
        ...draft.catalogue,
        brandName: '',
        title: draft.catalogue?.title || '',
        pdfUrl: '',
        storagePath: '',
        fileName: '',
        updatedAt: '',
      },
    }
  }
  return {
    ...draft,
    catalogue: {
      ...(draft.catalogue || {}),
      brandName: first.brandName || '',
      title: first.title || first.brandName || draft.catalogue?.title || '',
      pdfUrl: first.pdfUrl,
      storagePath: first.storagePath || '',
      fileName: first.fileName || '',
      updatedAt: first.updatedAt || '',
    },
  }
}
