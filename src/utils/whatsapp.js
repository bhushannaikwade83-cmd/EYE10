export const DEFAULT_WHATSAPP_NUMBER = '9773609077'

export const buildWhatsAppUrl = (
  inputNumber = DEFAULT_WHATSAPP_NUMBER,
  message = ''
) => {
  const digits = String(inputNumber || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, '')
  const withCountry = digits.startsWith('91') ? digits : `91${digits}`
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${withCountry}${encodedMessage}`
}
