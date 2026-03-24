import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

function envTrim(key) {
  return String(import.meta.env[key] ?? '').trim()
}

const measurementId = envTrim('VITE_FIREBASE_MEASUREMENT_ID')

const firebaseConfig = {
  apiKey: envTrim('VITE_FIREBASE_API_KEY'),
  authDomain: envTrim('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: envTrim('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: envTrim('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: envTrim('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: envTrim('VITE_FIREBASE_APP_ID'),
  ...(measurementId ? { measurementId } : {}),
}

const REQUIRED = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]

/** True when all required web config fields are non-empty (build-time env). */
export function isFirebaseConfigured() {
  return REQUIRED.every((k) => Boolean(firebaseConfig[k]))
}

let app = null
let auth = null
let db = null
let storage = null

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (err) {
    console.error('[EYE10] Firebase initialization failed:', err)
    app = null
    auth = null
    db = null
    storage = null
  }
} else if (typeof window !== 'undefined') {
  console.warn(
    '[EYE10] Firebase env vars missing. Set VITE_FIREBASE_* in .env (local) or your host (e.g. Vercel) and redeploy.'
  )
}

/** Google Analytics (browser only; needs measurementId in env) */
const analyticsPromise =
  app && typeof window !== 'undefined' && measurementId
    ? isSupported().then((ok) => (ok ? getAnalytics(app) : null))
    : Promise.resolve(null)

export { auth, db, storage, analyticsPromise }
export default app
