const LAST_INQUIRY_KEY = 'eye10LastInquiryContact'

export const saveLastInquiryContact = ({ name, phone, email }) => {
  try {
    const payload = {
      name: String(name || '').trim(),
      phone: String(phone || '').trim(),
      email: String(email || '').trim(),
      savedAt: new Date().toISOString(),
    }
    if (!payload.phone && !payload.email) return
    localStorage.setItem(LAST_INQUIRY_KEY, JSON.stringify(payload))
    window.dispatchEvent(new Event('eye10InquiryContactUpdated'))
  } catch (_) {}
}

export const getLastInquiryContact = () => {
  try {
    const raw = localStorage.getItem(LAST_INQUIRY_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data) return null
    if (typeof data.phone !== 'string' && typeof data.email !== 'string') return null
    return {
      name: data.name || '',
      phone: typeof data.phone === 'string' ? data.phone : '',
      email: typeof data.email === 'string' ? data.email : '',
      savedAt: data.savedAt || null,
    }
  } catch (_) {
    return null
  }
}
