import { supabase } from '../supabase/client'
import { useResolvedMediaUrl } from '../hooks/useResolvedMediaUrl'
import { canUseAdminStorage, deleteAdminFile, uploadAdminFile } from '../utils/mediaStorage'
import { mergeSiteContent } from '../content/defaultSiteContent'
import toast from 'react-hot-toast'

const MAX_BANNERS = 5
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 42 * 1024 * 1024

function guessMediaType(file) {
  const t = file.type || ''
  if (t.startsWith('video/')) return 'video'
  if (t.startsWith('image/')) return 'image'
  return null
}

function allowedFile(file) {
  const ok = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'video/quicktime']
  return ok.includes(file.type)
}

function AdminBannerMediaPreview({ banner }) {
  const { url } = useResolvedMediaUrl(banner?.mediaUrl || '')
  const src = url || banner?.mediaUrl
  if (!src) return null
  return banner.mediaType === 'video' ? (
    <video src={src} muted playsInline />
  ) : (
    <img src={src} alt="" />
  )
}

export function AdminHomeBanners({ draft, setDraft, saveContent, saving, setSaving }) {
  const banners = [...(draft.homeBanners || [])].slice(0, MAX_BANNERS)

  const persist = async (nextBanners) => {
    const merged = mergeSiteContent({ ...draft, homeBanners: nextBanners })
    await saveContent(merged)
    setDraft(merged)
  }

  const addBanner = () => {
    if (banners.length >= MAX_BANNERS) {
      toast.error(`Maximum ${MAX_BANNERS} banners`)
      return
    }
    const id = `hb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    setDraft((prev) => ({
      ...prev,
      homeBanners: [
        ...(prev.homeBanners || []),
        {
          id,
          mediaUrl: '',
          mediaType: 'image',
          storagePath: '',
          title: '',
          linkUrl: '',
        },
      ],
    }))
  }

  const updateField = (id, key, value) => {
    setDraft((prev) => ({
      ...prev,
      homeBanners: (prev.homeBanners || []).map((b) =>
        b.id === id ? { ...b, [key]: value } : b
      ),
    }))
  }

  const handleSaveMeta = async () => {
    setSaving(true)
    try {
      await saveContent(mergeSiteContent(draft))
      toast.success('Banner settings saved')
    } catch (e) {
      toast.error(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (bannerId, e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!allowedFile(file)) {
      toast.error('Use JPEG, PNG, MP4, WebM, or MOV only.')
      return
    }
    const mt = guessMediaType(file)
    if (!mt) {
      toast.error('Unsupported file type.')
      return
    }
    const max = mt === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (file.size > max) {
      toast.error(mt === 'video' ? 'Video must be under 42 MB.' : 'Image must be under 10 MB.')
      return
    }
    const { data: { session } = {} } = await supabase.auth.getSession()
    if (!canUseAdminStorage() || !session?.user) {
      toast.error('Sign in and configure storage (Supabase Storage or B2 — see .env.example).')
      return
    }

    const ext = (file.name.split('.').pop() || (mt === 'video' ? 'mp4' : 'jpg')).replace(/[^a-z0-9]/gi, '')
    const storagePath = `home-banners/${bannerId}/media.${ext}`

    try {
      const { url } = await uploadAdminFile({
        storagePath,
        file,
        contentType: file.type,
      })
      const nextBanners = (draft.homeBanners || []).map((b) =>
        b.id === bannerId
          ? { ...b, mediaUrl: url, mediaType: mt, storagePath }
          : b
      )
      await persist(nextBanners)
      toast.success('Media uploaded')
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Upload failed. Check Storage policies and admin access.')
    }
  }

  const removeBanner = async (id) => {
    const b = banners.find((x) => x.id === id)
    if (b?.storagePath && canUseAdminStorage()) {
      try {
        await deleteAdminFile(b.storagePath)
      } catch (err) {
        console.warn(err)
      }
    }
    const nextBanners = (draft.homeBanners || []).filter((x) => x.id !== id)
    try {
      await persist(nextBanners)
      toast.success('Banner removed')
    } catch (e) {
      toast.error(e?.message || 'Failed to remove')
    }
  }

  const applyExternalUrl = (id, url) => {
    updateField(id, 'mediaUrl', url.trim())
    updateField(id, 'storagePath', '')
    if (url.trim()) {
      const lower = url.toLowerCase()
      const isVid = lower.includes('.mp4') || lower.includes('.webm') || lower.includes('video')
      updateField(id, 'mediaType', isVid ? 'video' : 'image')
    }
  }

  return (
    <div className="card admin-card">
      <h2>Home offers slider</h2>
      <p className="admin-muted">
        Up to <strong>{MAX_BANNERS}</strong> slides at the top of the homepage (before the main hero text).
        Upload <strong>PNG</strong>, <strong>JPEG</strong>, <strong>MP4</strong>, <strong>WebM</strong>, or{' '}
        <strong>MOV</strong>. Or paste a direct URL to an image or video file.
      </p>

      <div className="admin-actions-row" style={{ marginTop: '12px' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={addBanner}
          disabled={banners.length >= MAX_BANNERS}
        >
          Add banner ({banners.length}/{MAX_BANNERS})
        </button>
        <button type="button" className="btn btn-outline" disabled={saving} onClick={handleSaveMeta}>
          Save titles &amp; links
        </button>
      </div>

      {(draft.homeBanners || []).length === 0 ? (
        <p className="admin-muted" style={{ marginTop: '20px' }}>
          No banners yet. Add a banner, then upload media or paste a URL.
        </p>
      ) : (
        <div className="admin-banner-stack">
          {(draft.homeBanners || []).map((b, idx) => (
            <div key={b.id} className="admin-banner-card">
              <div className="admin-banner-card__head">
                <strong>Banner {idx + 1}</strong>
                <button type="button" className="btn btn-outline" onClick={() => removeBanner(b.id)}>
                  Remove
                </button>
              </div>

              {b.mediaUrl ? (
                <div className="admin-banner-preview">
                  <AdminBannerMediaPreview banner={b} />
                </div>
              ) : null}

              <label style={{ display: 'block', marginTop: '12px' }}>
                <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Upload file</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,video/mp4,video/webm,video/quicktime"
                  onChange={(e) => void handleUpload(b.id, e)}
                  disabled={!canUseAdminStorage()}
                />
              </label>

              <label style={{ display: 'block', marginTop: '10px' }}>
                <span style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Or media URL</span>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  value={b.mediaUrl || ''}
                  onChange={(e) => applyExternalUrl(b.id, e.target.value)}
                  placeholder="https://…"
                />
              </label>

              <input
                className="input"
                style={{ width: '100%', marginTop: '10px' }}
                value={b.title || ''}
                onChange={(e) => updateField(b.id, 'title', e.target.value)}
                placeholder="Caption (optional)"
              />
              <input
                className="input"
                style={{ width: '100%', marginTop: '8px' }}
                value={b.linkUrl || ''}
                onChange={(e) => updateField(b.id, 'linkUrl', e.target.value)}
                placeholder="Link when slide is clicked (optional)"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
