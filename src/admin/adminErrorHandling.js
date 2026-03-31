export function logAdminError(context, error, meta = {}) {
  const message = error?.message || 'Unknown error'
  const stack = error?.stack || ''
  // Keep detailed diagnostics in console only.
  console.error(`[Admin] ${context}: ${message}`, { meta, error, stack })
}

export function getAdminErrorMessage(action = 'process request') {
  return `Unable to ${action} right now. Please try again.`
}

export function getAdminInlineErrorMessage(section = 'data') {
  return `Unable to load ${section}. Please refresh and try again.`
}
