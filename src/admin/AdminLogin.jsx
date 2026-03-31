import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase, isSupabaseConfigured } from '../supabase/client'
import { isAdminUser } from '../utils/adminAccess'
import { AdminShell } from './AdminShell'
import './AdminLogin.css'

function loginErrorMessage(error) {
  const msg = String(error?.message || '')
  if (/admin check timed out/i.test(msg)) {
    return 'Sign-in verification timed out. Please try again.'
  }
  if (/invalid login credentials|invalid email or password/i.test(msg)) {
    return 'Invalid email or password.'
  }
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email before signing in.'
  if (/too many requests/i.test(msg)) return 'Too many attempts. Try again in a few minutes.'
  return 'Unable to sign in right now. Please try again.'
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.adminDenied) {
      toast.error('Access denied. Your account is not authorized for admin access.')
      navigate('/admin/login', { replace: true, state: {} })
    }
    if (location.state?.supabaseMissing) {
      toast.error('Service is currently unavailable. Please contact support.')
      navigate('/admin/login', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!supabase) {
      toast.error('Unable to initialize sign-in service. Please try again shortly.')
      return
    }
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        console.error('Login error:', error.message)
        throw error
      }
      console.log('Login success:', data)
      const uid = data.user?.id
      const ok = await isAdminUser(uid)
      if (!ok) {
        await supabase.auth.signOut()
        toast.error('Access denied. Your account is not authorized for admin access.')
        return
      }
      toast.success('Welcome back. You are now signed in.')
      navigate('/admin')
    } catch (error) {
      toast.error(loginErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const configured = isSupabaseConfigured() && supabase

  return (
    <AdminShell
      title="Admin login"
      subtitle="Secure sign-in for authorized administrators."
      rightSlot={null}
    >
      <div className="admin-login">
        <div className="admin-login-card card">
          <h2 style={{ marginBottom: '8px' }}>Admin Login</h2>
          {!configured ? (
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
              Sign-in service is currently unavailable. Please contact support.
            </p>
          ) : null}
          <p style={{ color: 'var(--gray-dark)', marginBottom: '12px' }}>
            Sign in using your approved administrator account.
          </p>
          <p
            className="review-hint admin-login-hint"
            style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--gray-dark)' }}
          >
            <strong>Note:</strong> Access is restricted to authorized admin users only.
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

            <button className="btn btn-primary" type="submit" disabled={loading || !configured}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  )
}

export default AdminLogin
