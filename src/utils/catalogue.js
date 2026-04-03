import { buildB2DownloadProxyUrl, resolveB2MediaUrl } from './b2PrivateUrls'

/** PDF catalogues with per–brand labels (site content). */

export function newCatalogueItemId() {
  return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function storagePathForCatalogueItem(itemId) {
  const safe = String(itemId || 'item').replace(/[^a-zA-Z0-9_-]/g, '_')
  return `catalogue/brands/${safe}/catalogue.pdf`
}

/** Normalized catalogue rows for storefront from `catalogueItems` only. */
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
  return []
}

/** First PDF URL for simple “primary” link fallbacks. */
export function getPrimaryCataloguePdfUrl(content) {
  const list = getCatalogueItems(content)
  return list[0]?.pdfUrl || ''
}

/**
 * PDF for a product brand name: exact case-insensitive match on `brandName`.
 */
export function getCataloguePdfUrlForBrand(content, brandName) {
  const item = getCatalogueItemForBrand(content, brandName)
  return item?.pdfUrl || ''
}

/** Resolved row for a product brand by exact case-insensitive name match. */
export function getCatalogueItemForBrand(content, brandName) {
  const items = getCatalogueItems(content)
  if (!items.length) return null
  const b = String(brandName || '').trim().toLowerCase()
  const match = items.find((i) => String(i.brandName || '').trim().toLowerCase() === b)
  if (match) return match
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
  const raw = String(item?.pdfUrl || '').trim()
  if (!raw) return
  // Open a blank tab synchronously to avoid popup blocking.
  const openedTab = window.open('about:blank', '_blank')
  if (openedTab) openedTab.opener = null
  let url = raw
  try {
    url = await resolveB2MediaUrl(raw)
  } catch {
    url = raw
  }
  const name = suggestedCatalogueDownloadFilename(item)
  if (openedTab) openedTab.location.href = url
  else window.open(url, '_blank')
  try {
    const dlUrl = buildB2DownloadProxyUrl(raw, { download: true, filename: name }) || url
    const a = document.createElement('a')
    a.href = dlUrl
    a.download = name
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch {
    // Public Storage URLs sometimes omit CORS for fetch; viewing in the new tab is enough.
  }
}

/**
 * Keep legacy `catalogue` in sync with the first item that has a PDF (older code compatibility).
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
