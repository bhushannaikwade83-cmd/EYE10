import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import toast from 'react-hot-toast'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { db, storage } from '../firebase/config'
import './AdminProducts.css'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 45 * 1024 * 1024

const ACCEPT_IMAGES = 'image/jpeg,image/png'
const ACCEPT_VIDEOS = 'video/mp4,video/webm,video/quicktime'

function safeFileName(name) {
  const n = String(name || 'file')
  // Keep common filename chars; strip the rest.
  return n.replace(/[^a-zA-Z0-9._-]+/g, '_')
}

function parseLines(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseBenefits(text) {
  const lines = parseLines(text)
  return lines.map((line) => {
    if (line.includes('|')) {
      const [title, subtitle] = line.split('|').map((s) => s.trim())
      return { title: title || 'Offer', subtitle: subtitle || '' }
    }
    return line
  })
}

function toOptionalNumber(v) {
  if (v === '' || v === null || v === undefined) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function coerceImages(product) {
  if (Array.isArray(product?.images) && product.images.length > 0) return product.images
  if (product?.image) return [product.image]
  return []
}

function coerceVideos(product) {
  if (Array.isArray(product?.videos)) return product.videos
  return []
}

function getMediaStoragePaths(product, key) {
  if (Array.isArray(product?.[key])) return product[key]
  return []
}

function buildProductPayload(form, override) {
  const images = override?.images ?? form.images
  const videos = override?.videos ?? form.videos
  const imageStoragePaths = override?.imageStoragePaths ?? form.imageStoragePaths
  const videoStoragePaths = override?.videoStoragePaths ?? form.videoStoragePaths

  const image = images?.[0] ? images[0] : ''

  const features = parseLines(form.featuresText)
  const benefits = parseBenefits(form.benefitsText)

  const payload = {
    name: form.name.trim(),
    brand: form.brand.trim(),
    category: form.category.trim(),
    price: toOptionalNumber(form.price),
    originalPrice: toOptionalNumber(form.originalPrice),
    discount: toOptionalNumber(form.discount),
    stock: toOptionalNumber(form.stock) ?? 0,
    isNew: Boolean(form.isNew),
    bestSeller: Boolean(form.bestSeller),
    limitedEdition: Boolean(form.limitedEdition),

    image,
    images: images || [],
    videos: videos || [],

    // Keep these for deletion from Storage later.
    imageStoragePaths: imageStoragePaths || [],
    videoStoragePaths: videoStoragePaths || [],

    description: form.description || '',
    frameType: form.frameType || '',
    features,
    benefits,

    rating: toOptionalNumber(form.rating),
    reviewCount: toOptionalNumber(form.reviewCount),
  }

  // Remove undefined numeric fields so we don't write "undefined".
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined) delete payload[k]
  })

  return payload
}

function emptyForm() {
  return {
    // For "Add product" flow only.
    productIdInput: '',

    name: '',
    brand: '',
    category: '',
    price: '',
    originalPrice: '',
    discount: '',
    stock: '0',
    isNew: false,
    bestSeller: false,
    limitedEdition: false,

    imageUrls: [],
    videoUrls: [],
    images: [],
    videos: [],
    imageStoragePaths: [],
    videoStoragePaths: [],

    description: '',
    frameType: '',
    featuresText: '',
    benefitsText: '',

    rating: '',
    reviewCount: '',
  }
}

export function AdminProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  const [mode, setMode] = useState('edit') // 'edit' | 'add'
  const [selectedId, setSelectedId] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const [form, setForm] = useState(() => emptyForm())
  const [pendingAddImages, setPendingAddImages] = useState([])
  const [pendingAddVideos, setPendingAddVideos] = useState([])

  const [search, setSearch] = useState('')

  const refresh = async () => {
    if (!db) {
      setProducts([])
      setLoading(false)
      return
    }
    setError('')
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'products'))
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setProducts(list)
    } catch (e) {
      console.error(e)
      setError(e?.message || 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter((p) => {
      const name = String(p.name || '').toLowerCase()
      const brand = String(p.brand || '').toLowerCase()
      const cat = String(p.category || '').toLowerCase()
      return name.includes(term) || brand.includes(term) || cat.includes(term) || p.id.includes(term)
    })
  }, [products, search])

  const loadIntoForm = (p) => {
    const images = coerceImages(p)
    const videos = coerceVideos(p)

    setForm({
      ...emptyForm(),
      productIdInput: '',
      name: p.name || '',
      brand: p.brand || '',
      category: p.category || '',
      price: p.price ?? '',
      originalPrice: p.originalPrice ?? '',
      discount: p.discount ?? '',
      stock: String(p.stock ?? 0),
      isNew: Boolean(p.isNew),
      bestSeller: Boolean(p.bestSeller),
      limitedEdition: Boolean(p.limitedEdition),

      images: images,
      imageStoragePaths: getMediaStoragePaths(p, 'imageStoragePaths'),
      videos: videos,
      videoStoragePaths: getMediaStoragePaths(p, 'videoStoragePaths'),

      description: p.description || '',
      frameType: p.frameType || '',
      featuresText: Array.isArray(p.features) ? p.features.join('\n') : '',
      benefitsText: Array.isArray(p.benefits)
        ? p.benefits
            .map((b) => {
              if (typeof b === 'string') return b
              if (b && typeof b === 'object') {
                const t = String(b.title ?? b.label ?? '')
                const s = String(b.subtitle ?? b.text ?? '')
                if (s) return `${t} | ${s}`
                return t
              }
              return ''
            })
            .filter(Boolean)
            .join('\n')
        : '',

      rating: p.rating ?? '',
      reviewCount: p.reviewCount ?? '',
    })
    setPendingAddImages([])
    setPendingAddVideos([])
    setSelectedId(p.id)
    setMode('edit')
  }

  const startAdd = () => {
    setForm(emptyForm())
    setPendingAddImages([])
    setPendingAddVideos([])
    setSelectedId('')
    setMode('add')
  }

  const ensureArrays = () => {
    setForm((prev) => ({
      ...prev,
      images: Array.isArray(prev.images) ? prev.images : [],
      videos: Array.isArray(prev.videos) ? prev.videos : [],
      imageStoragePaths: Array.isArray(prev.imageStoragePaths) ? prev.imageStoragePaths : [],
      videoStoragePaths: Array.isArray(prev.videoStoragePaths) ? prev.videoStoragePaths : [],
    }))
  }

  useEffect(() => {
    ensureArrays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const removeExistingImageAt = async (idx) => {
    const storagePath = form.imageStoragePaths?.[idx]
    if (storagePath && storage) {
      try {
        await deleteObject(ref(storage, storagePath))
      } catch (e) {
        console.warn('Image delete failed (non-blocking):', e)
      }
    }

    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
      imageStoragePaths: prev.imageStoragePaths.filter((_, i) => i !== idx),
    }))
  }

  const removeExistingVideoAt = async (idx) => {
    const storagePath = form.videoStoragePaths?.[idx]
    if (storagePath && storage) {
      try {
        await deleteObject(ref(storage, storagePath))
      } catch (e) {
        console.warn('Video delete failed (non-blocking):', e)
      }
    }

    setForm((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== idx),
      videoStoragePaths: prev.videoStoragePaths.filter((_, i) => i !== idx),
    }))
  }

  const uploadFilesToProduct = async (productId, imageFiles, videoFiles) => {
    if (!storage) throw new Error('Firebase Storage not configured')
    const imageUploads = []
    const videoUploads = []

    const imgs = Array.from(imageFiles || [])
    const vids = Array.from(videoFiles || [])

    for (let i = 0; i < imgs.length; i++) {
      const file = imgs[i]
      if (!file) continue
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Images must be JPG or PNG.')
        continue
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error('Image too large (max 10MB).')
        continue
      }

      const ext = file.type === 'image/png' ? 'png' : 'jpg'
      const storagePath = `product-media/${productId}/images/${Date.now()}_${i}_${safeFileName(
        file.name
      ).replace(/\\.[^/.]+$/, '')}.${ext}`
      const r = ref(storage, storagePath)
      await uploadBytes(r, file, { contentType: file.type })
      const url = await getDownloadURL(r)
      imageUploads.push({ url, storagePath })
    }

    for (let i = 0; i < vids.length; i++) {
      const file = vids[i]
      if (!file) continue
      if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
        toast.error('Videos must be MP4, WebM, or MOV.')
        continue
      }
      if (file.size > MAX_VIDEO_BYTES) {
        toast.error('Video too large (max 45MB).')
        continue
      }

      const ext =
        file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4'
      const storagePath = `product-media/${productId}/videos/${Date.now()}_${i}_${safeFileName(
        file.name
      ).replace(/\\.[^/.]+$/, '')}.${ext}`
      const r = ref(storage, storagePath)
      await uploadBytes(r, file, { contentType: file.type })
      const url = await getDownloadURL(r)
      videoUploads.push({ url, storagePath })
    }

    return {
      imageUploads,
      videoUploads,
    }
  }

  const handleCreateOrUpdate = async () => {
    if (!db) {
      toast.error('Firebase Firestore not configured.')
      return
    }

    // Basic validation
    if (!form.name.trim()) return toast.error('Product name is required.')
    if (!form.brand.trim()) return toast.error('Brand is required.')
    if (!form.category.trim()) return toast.error('Category is required.')
    if (!String(form.price).trim()) return toast.error('Price is required.')
    if (!Number.isFinite(Number(form.price))) return toast.error('Price must be a number.')

    setSaving(true)
    try {
      const idInput = mode === 'add' ? String(form.productIdInput || '').trim() : selectedId
      if (mode === 'add' && !idInput) {
        // We'll create an id via addDoc.
        // First write placeholder so we can upload media under a known productId.
        const placeholderPayload = buildProductPayload(form, {
          images: [],
          videos: [],
          imageStoragePaths: [],
          videoStoragePaths: [],
        })
        const createdRef = await addDoc(collection(db, 'products'), placeholderPayload)
        const productId = createdRef.id

        const { imageUploads, videoUploads } = await uploadFilesToProduct(
          productId,
          pendingAddImages,
          pendingAddVideos
        )

        const finalPayload = buildProductPayload(form, {
          images: imageUploads.map((x) => x.url),
          videos: videoUploads.map((x) => x.url),
          imageStoragePaths: imageUploads.map((x) => x.storagePath),
          videoStoragePaths: videoUploads.map((x) => x.storagePath),
        })

        await setDoc(doc(db, 'products', productId), finalPayload, { merge: true })
        toast.success('Product created.')
        await refresh()
        loadIntoForm({ id: productId, ...finalPayload })
        return
      }

      const productId = mode === 'edit' ? selectedId : idInput
      if (!productId) throw new Error('Missing product id.')

      // Upload media immediately for edit; pending media is only for add-mode.
      let mediaOverride = null
      if (mode === 'add') {
        // Add-mode with explicit id -> upload files then save final payload.
        const placeholderPayload = buildProductPayload(form, {
          images: [],
          videos: [],
          imageStoragePaths: [],
          videoStoragePaths: [],
        })
        await setDoc(doc(db, 'products', productId), placeholderPayload, { merge: true })

        const { imageUploads, videoUploads } = await uploadFilesToProduct(
          productId,
          pendingAddImages,
          pendingAddVideos
        )

        mediaOverride = {
          images: imageUploads.map((x) => x.url),
          videos: videoUploads.map((x) => x.url),
          imageStoragePaths: imageUploads.map((x) => x.storagePath),
          videoStoragePaths: videoUploads.map((x) => x.storagePath),
        }
      }

      const finalPayload =
        mediaOverride !== null
          ? buildProductPayload(form, mediaOverride)
          : buildProductPayload(form, {
              images: form.images || [],
              videos: form.videos || [],
              imageStoragePaths: form.imageStoragePaths || [],
              videoStoragePaths: form.videoStoragePaths || [],
            })

      await setDoc(doc(db, 'products', productId), finalPayload, { merge: true })
      toast.success(mode === 'add' ? 'Product created.' : 'Product saved.')

      await refresh()
      loadIntoForm({ id: productId, ...finalPayload })
      setPendingAddImages([])
      setPendingAddVideos([])
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return
    const ok = window.confirm('Delete this product? This cannot be undone.')
    if (!ok) return
    setDeletingId(selectedId)
    try {
      const p = products.find((x) => x.id === selectedId)
      if (p && storage) {
        const imgPaths = getMediaStoragePaths(p, 'imageStoragePaths')
        const vidPaths = getMediaStoragePaths(p, 'videoStoragePaths')
        await Promise.all(
          [...imgPaths, ...vidPaths].filter(Boolean).map((path) => deleteObject(ref(storage, path)))
        )
      }

      await deleteDoc(doc(db, 'products', selectedId))
      toast.success('Product deleted.')
      await refresh()
      startAdd()
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Delete failed')
    } finally {
      setDeletingId('')
    }
  }

  const handleEditUploadImages = async (files) => {
    if (!selectedId) return
    if (!storage) return toast.error('Firebase Storage not configured.')
    const list = Array.from(files || [])
    if (list.length === 0) return

    setSaving(true)
    try {
      const { imageUploads } = await uploadFilesToProduct(selectedId, list, [])
      if (imageUploads.length === 0) return
      const nextImages = [...(form.images || []), ...imageUploads.map((x) => x.url)]
      const nextImageStoragePaths = [
        ...(form.imageStoragePaths || []),
        ...imageUploads.map((x) => x.storagePath),
      ]

      const nextForm = { ...form, images: nextImages, imageStoragePaths: nextImageStoragePaths }
      setForm(nextForm)

      // Persist immediately so uploaded files are linked to the product doc.
      await setDoc(
        doc(db, 'products', selectedId),
        buildProductPayload(nextForm, {
          images: nextImages,
          imageStoragePaths: nextImageStoragePaths,
          videos: form.videos || [],
          videoStoragePaths: form.videoStoragePaths || [],
        }),
        { merge: true }
      )

      toast.success('Images uploaded.')
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const handleEditUploadVideos = async (files) => {
    if (!selectedId) return
    if (!storage) return toast.error('Firebase Storage not configured.')
    const list = Array.from(files || [])
    if (list.length === 0) return

    setSaving(true)
    try {
      const { videoUploads } = await uploadFilesToProduct(selectedId, [], list)
      if (videoUploads.length === 0) return
      const nextVideos = [...(form.videos || []), ...videoUploads.map((x) => x.url)]
      const nextVideoStoragePaths = [
        ...(form.videoStoragePaths || []),
        ...videoUploads.map((x) => x.storagePath),
      ]

      const nextForm = { ...form, videos: nextVideos, videoStoragePaths: nextVideoStoragePaths }
      setForm(nextForm)

      await setDoc(
        doc(db, 'products', selectedId),
        buildProductPayload(nextForm, {
          videos: nextVideos,
          videoStoragePaths: nextVideoStoragePaths,
          images: form.images || [],
          imageStoragePaths: form.imageStoragePaths || [],
        }),
        { merge: true }
      )

      toast.success('Videos uploaded.')
    } catch (e) {
      console.error(e)
      toast.error(e?.message || 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePickAddImages = (files) => {
    const list = Array.from(files || [])
    setPendingAddImages(list)
  }

  const handlePickAddVideos = (files) => {
    const list = Array.from(files || [])
    setPendingAddVideos(list)
  }

  const mediaCount = (form.images || []).length + (form.videos || []).length

  return (
    <div className="card admin-card admin-products">
      <div className="admin-products-head">
        <div>
          <h2 style={{ marginTop: 0 }}>Products (CRUD)</h2>
          <p className="admin-muted" style={{ marginBottom: 0 }}>
            Add/edit/delete products stored in Firestore collection <code>products</code>. Photos
            and videos are uploaded to Firebase Storage.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startAdd}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="admin-products-layout">
        <div className="admin-products-list">
          <div className="admin-products-toolbar">
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name/brand/category or id…"
            />
          </div>

          {loading ? (
            <div className="loading">Loading products…</div>
          ) : error ? (
            <div className="admin-status-box">{error}</div>
          ) : (
            <div className="admin-products-list-items">
              {filteredProducts.length === 0 ? (
                <p className="admin-muted">No products match your search.</p>
              ) : (
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`admin-products-row ${selectedId === p.id ? 'active' : ''}`}
                    onClick={() => loadIntoForm(p)}
                  >
                    <div className="admin-products-row-main">
                      <div className="admin-products-row-title">
                        <strong>{p.name || 'Untitled'}</strong>
                      </div>
                      <div className="admin-products-row-sub">
                        <span>{p.brand || '—'}</span>
                        <span className="dot" />
                        <span>{p.category || '—'}</span>
                        <span className="dot" />
                        <span>₹{p.price ?? '—'}</span>
                      </div>
                      <div className="admin-products-row-id">ID: {p.id}</div>
                    </div>
                    <div className="admin-products-row-actions">
                      <Pencil size={18} />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="admin-products-form">
          {mode === 'edit' && !selectedId ? (
            <p className="admin-muted">Select a product on the left to edit.</p>
          ) : (
            <>
              <div className="admin-products-form-card">
                <div className="admin-products-form-head">
                  <h3 style={{ margin: 0 }}>
                    {mode === 'add' ? 'Add new product' : `Edit product: ${selectedId}`}
                  </h3>
                  {mode === 'edit' && selectedId ? (
                    <button
                      type="button"
                      className="btn btn-outline danger-btn"
                      onClick={() => void handleDelete()}
                      disabled={deletingId === selectedId}
                    >
                      <Trash2 size={18} />
                      {deletingId === selectedId ? 'Deleting…' : 'Delete'}
                    </button>
                  ) : null}
                </div>

                {mode === 'add' ? (
                  <div className="admin-products-form-section">
                    <label className="admin-label">
                      Product ID (optional). If empty, Firestore will auto-generate.
                      <input
                        className="input"
                        value={form.productIdInput}
                        onChange={(e) => setForm((prev) => ({ ...prev, productIdInput: e.target.value }))}
                        placeholder="e.g. sunglasses_001"
                      />
                    </label>
                  </div>
                ) : null}

                <div className="admin-products-form-fields">
                  <div className="admin-products-grid-2">
                    <label className="admin-label">
                      Name
                      <input
                        className="input"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Product name"
                      />
                    </label>
                    <label className="admin-label">
                      Brand
                      <input
                        className="input"
                        value={form.brand}
                        onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                        placeholder="e.g. Ray-Ban"
                      />
                    </label>

                    <label className="admin-label">
                      Category
                      <input
                        className="input"
                        value={form.category}
                        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g. sunglasses / glasses"
                      />
                    </label>

                    <label className="admin-label">
                      Frame type (optional)
                      <input
                        className="input"
                        value={form.frameType}
                        onChange={(e) => setForm((prev) => ({ ...prev, frameType: e.target.value }))}
                        placeholder="e.g. Full Rim / Rimless"
                      />
                    </label>
                  </div>

                  <div className="admin-products-grid-3">
                    <label className="admin-label">
                      Price
                      <input
                        className="input"
                        value={form.price}
                        onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g. 2999"
                        inputMode="decimal"
                      />
                    </label>
                    <label className="admin-label">
                      Original price (optional)
                      <input
                        className="input"
                        value={form.originalPrice}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, originalPrice: e.target.value }))
                        }
                        placeholder="e.g. 3999"
                        inputMode="decimal"
                      />
                    </label>
                    <label className="admin-label">
                      Discount % (optional)
                      <input
                        className="input"
                        value={form.discount}
                        onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))}
                        placeholder="e.g. 25"
                        inputMode="decimal"
                      />
                    </label>
                  </div>

                  <div className="admin-products-form-section">
                    <label className="admin-label">
                      Stock quantity
                      <input
                        className="input"
                        value={form.stock}
                        onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                        placeholder="e.g. 12"
                        inputMode="numeric"
                      />
                    </label>
                    <div className="admin-checkbox-row">
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={form.isNew}
                          onChange={(e) => setForm((prev) => ({ ...prev, isNew: e.target.checked }))}
                        />
                        New
                      </label>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={form.bestSeller}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, bestSeller: e.target.checked }))
                          }
                        />
                        Best Seller
                      </label>
                      <label className="admin-check">
                        <input
                          type="checkbox"
                          checked={form.limitedEdition}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, limitedEdition: e.target.checked }))
                          }
                        />
                        Limited
                      </label>
                    </div>
                  </div>

                  <div className="admin-products-form-section">
                    <label className="admin-label">
                      Description
                      <textarea
                        className="input"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Short description shown in Product Detail"
                      />
                    </label>
                  </div>

                  <div className="admin-products-grid-2">
                    <label className="admin-label">
                      Features (one per line)
                      <textarea
                        className="input"
                        rows={4}
                        value={form.featuresText}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, featuresText: e.target.value }))
                        }
                        placeholder="UV Protection&#10;Scratch Resistant"
                      />
                    </label>
                    <label className="admin-label">
                      Benefits (one per line)
                      <div className="admin-muted" style={{ marginTop: 4 }}>
                        Use <code>Title | Subtitle</code> for two-line benefits.
                      </div>
                      <textarea
                        className="input"
                        rows={4}
                        value={form.benefitsText}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, benefitsText: e.target.value }))
                        }
                        placeholder="Offer name | details"
                      />
                    </label>
                  </div>

                  <div className="admin-products-grid-3">
                    <label className="admin-label">
                      Rating (optional)
                      <input
                        className="input"
                        value={form.rating}
                        onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                        inputMode="decimal"
                        placeholder="e.g. 4.6"
                      />
                    </label>
                    <label className="admin-label">
                      Review count (optional)
                      <input
                        className="input"
                        value={form.reviewCount}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, reviewCount: e.target.value }))
                        }
                        inputMode="numeric"
                        placeholder="e.g. 120"
                      />
                    </label>
                    <div />
                  </div>

                  <div className="admin-products-form-section">
                    <div className="admin-products-form-section-head">
                      <strong>Photos & videos</strong>
                      <span className="admin-muted">
                        {mediaCount > 0 ? `${mediaCount} items currently set` : 'No media yet'}
                      </span>
                    </div>

                    {mode === 'add' ? (
                      <>
                        <label className="admin-label">
                          Upload images (JPG/PNG)
                          <input
                            type="file"
                            accept={ACCEPT_IMAGES}
                            multiple
                            className="input"
                            onChange={(e) => handlePickAddImages(e.target.files)}
                          />
                        </label>

                        <label className="admin-label" style={{ marginTop: 10 }}>
                          Upload videos (MP4/WebM/MOV)
                          <input
                            type="file"
                            accept={ACCEPT_VIDEOS}
                            multiple
                            className="input"
                            onChange={(e) => handlePickAddVideos(e.target.files)}
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="admin-label">
                          Add images
                          <input
                            type="file"
                            accept={ACCEPT_IMAGES}
                            multiple
                            className="input"
                            onChange={(e) => {
                              void handleEditUploadImages(e.target.files)
                              e.target.value = ''
                            }}
                            disabled={saving}
                          />
                        </label>

                        <label className="admin-label" style={{ marginTop: 10 }}>
                          Add videos
                          <input
                            type="file"
                            accept={ACCEPT_VIDEOS}
                            multiple
                            className="input"
                            onChange={(e) => {
                              void handleEditUploadVideos(e.target.files)
                              e.target.value = ''
                            }}
                            disabled={saving}
                          />
                        </label>

                        {(form.images || []).length > 0 ? (
                          <div className="admin-products-media-grid">
                            {form.images.map((url, idx) => (
                              <div key={`${url}-${idx}`} className="admin-products-media-item">
                                <img src={url} alt={`Image ${idx + 1}`} />
                                <button
                                  type="button"
                                  className="btn btn-outline admin-products-media-remove"
                                  onClick={() => void removeExistingImageAt(idx)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {(form.videos || []).length > 0 ? (
                          <div className="admin-products-media-grid">
                            {form.videos.map((url, idx) => (
                              <div key={`${url}-${idx}`} className="admin-products-media-item">
                                <video src={url} controls={false} muted playsInline />
                                <button
                                  type="button"
                                  className="btn btn-outline admin-products-media-remove"
                                  onClick={() => void removeExistingVideoAt(idx)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>

                  <div className="admin-products-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => void handleCreateOrUpdate()}
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : mode === 'add' ? 'Create product' : 'Save changes'}
                    </button>
                    {mode === 'edit' ? (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          const p = products.find((x) => x.id === selectedId)
                          if (p) loadIntoForm(p)
                        }}
                        disabled={saving}
                      >
                        Reset form
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

