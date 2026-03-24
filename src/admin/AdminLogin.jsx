import { useEffect, useState } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase/config'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { isFirestoreAdmin } from '../utils/adminAccess'

function loginErrorMessage(error) {
  const code = error?.code
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'Invalid email or password. Add this user in Firebase → Authentication → Email/Password.'
  }
  if (code === 'auth/invalid-email') return 'Enter a valid email address.'
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again in a few minutes.'
  if (code === 'auth/user-disabled') return 'This account has been disabled.'
  if (code === 'auth/invalid-api-key') {
    return 'Invalid Firebase API key. On Vercel/hosting, set VITE_FIREBASE_API_KEY (and other VITE_FIREBASE_*) in Environment Variables, then redeploy.'
  }
  return error?.message || 'Login failed'
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.adminDenied) {
      toast.error(
        'Not an admin: add a Firestore document admins/<your Firebase User UID> (see hint below).'
      )
      navigate('/admin/login', { replace: true, state: {} })
    }
    if (location.state?.firebaseMissing) {
      toast.error(
        'Firebase is not configured for this deployment. Add all VITE_FIREBASE_* variables on your host and redeploy.'
      )
      navigate('/admin/login', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (!auth) return undefined
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return
      try {
        const ok = await isFirestoreAdmin(user.uid)
        if (ok) navigate('/admin', { replace: true })
      } catch {
        /* ignore */
      }
    })
    return () => unsub()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!auth) {
      toast.error(
        isFirebaseConfigured()
          ? 'Firebase Auth is unavailable (e.g. invalid API key). Fix env vars or API key restrictions and redeploy.'
          : 'Firebase is not configured. Set VITE_FIREBASE_* env vars and redeploy.'
      )
      return
    }
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      const uid = auth.currentUser?.uid
      const ok = await isFirestoreAdmin(uid)
      if (!ok) {
        await signOut(auth)
        toast.error(
          'Signed in, but this user is not in the admins collection. In Firestore create document ID = your User UID under collection admins.'
        )
        return
      }
      toast.success('Admin login successful')
      navigate('/admin')
    } catch (error) {
      toast.error(loginErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="container" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '8px' }}>Admin Login</h1>
          {!auth && (
            <p
              style={{
                marginBottom: '16px',
                padding: '12px',
                borderRadius: '10px',
                background: 'rgb(var(--accent-rgb) / 0.12)',
                color: 'var(--dark)',
                fontSize: '0.95rem',
              }}
            >
              {isFirebaseConfigured()
                ? 'Firebase failed to initialize (invalid API key or project). Check the browser console and Google Cloud API key restrictions for your live domain.'
                : 'Firebase is not active: add all VITE_FIREBASE_* variables in Vercel → Settings → Environment Variables (match .env.example), then redeploy.'}
            </p>
          )}
          <p style={{ color: 'var(--gray-dark)', marginBottom: '12px' }}>
            Uses Firebase Authentication (same project as your <code>.env</code>). Sign in with an
            admin email you created under Firebase Console → Authentication.
          </p>
          <p
            className="review-hint"
            style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--gray-dark)' }}
          >
            <strong>Password</strong> is stored only in Firebase <strong>Authentication</strong> (not
            in Firestore). <strong>Admin access</strong>: Firestore → collection <code>admins</code>{' '}
            → add a document whose <strong>Document ID</strong> is your User UID from Authentication
            (e.g. <code>4hB86loRxhUGGUKPPeIYRvhJxNN2</code>) and optional field{' '}
            <code>role: &quot;admin&quot;</code>. Then publish <code>firestore.rules</code> from this
            project.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || !auth}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default AdminLogin
