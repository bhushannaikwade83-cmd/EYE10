import { mergeSiteContent } from '../content/defaultSiteContent'
import toast from 'react-hot-toast'
import { mirrorContactToNavbarFooter } from '../utils/siteContact'
import { syncLegacyCatalogueFromItems } from '../utils/catalogue'
import { getAdminErrorMessage, logAdminError } from './adminErrorHandling'

const FIELDS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://www.facebook.com/yourpage' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/yourprofile' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://twitter.com/yourprofile' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://www.youtube.com/@yourchannel' },
]

export function AdminSocialLinks({ draft, setDraft, saveContent, saving, setSaving }) {
  const sl = draft.socialLinks || {}

  const setUrl = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const synced = syncLegacyCatalogueFromItems(mirrorContactToNavbarFooter(draft))
      setDraft(synced)
      await saveContent(mergeSiteContent(synced))
      toast.success('Social links saved')
    } catch (e) {
      logAdminError('save social links', e)
      toast.error(getAdminErrorMessage('save social links'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card admin-card">
      <h2>Social links</h2>
      <p className="admin-muted">
        URLs appear as icons in the site footer. Leave a field empty to hide that network. Use full{' '}
        <code>https://</code> links.
      </p>

      <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
        {FIELDS.map(({ key, label, placeholder }) => (
          <label key={key} className="admin-label" style={{ display: 'block' }}>
            {label}
            <input
              className="input"
              style={{ width: '100%', marginTop: '6px' }}
              type="url"
              inputMode="url"
              value={sl[key] || ''}
              onChange={(e) => setUrl(key, e.target.value)}
              placeholder={placeholder}
              autoComplete="off"
            />
          </label>
        ))}
      </div>

      <div className="admin-actions-row" style={{ marginTop: '24px' }}>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void handleSave()}>
          {saving ? 'Saving…' : 'Save social links'}
        </button>
      </div>
    </div>
  )
}
