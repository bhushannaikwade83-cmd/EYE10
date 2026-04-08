export const DEFAULT_WHATSAPP_NUMBER = '9773609077'

export const buildWhatsAppUrl = (
  inputNumber = '',
  message = ''
) => {
  const digits = String(inputNumber || '').replace(/\D/g, '')
  // Require a real target number; never silently fall back to defaults.
  if (digits.length < 10) return ''
  const withCountry = digits.length === 10 ? `91${digits}` : digits
  const encodedMessage = message ? `&text=${encodeURIComponent(message)}` : ''
  // api.whatsapp.com is more reliable on some mobile browsers than wa.me redirects.
  return `https://api.whatsapp.com/send?phone=${withCountry}${encodedMessage}`
}
