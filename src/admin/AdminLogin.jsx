import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase, isSupabaseConfigured } from '../supabase/client'
import { isAdminUser } from '../utils/adminAccess'
import { AdminShell } from './AdminShell'
import './AdminLogin.css'

function loginErrorMessage(error) {
  const msg = String(error?.message || '')
  if (/invalid login credentials|invalid email or password/i.test(msg)) {
    return 'Invalid email or password. Create the user in Supabase → Authentication.'
  }
  if (/email not confirmed/i.test(msg)) return 'Confirm your email in Supabase Auth, or disable email confirmation for testing.'
  if (/too many requests/i.test(msg)) return 'Too many attempts. Try again in a few minutes.'
  return msg || 'Login failed'
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
        'Not an admin: add your user id to Supabase table public.admins (user_id = UUID from Authentication).'
      )
      navigate('/admin/login', { replace: true, state: {} })
    }
    if (location.state?.supabaseMissing) {
      toast.error(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY on your host and redeploy.'
      )
      navigate('/admin/login', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (!supabase) return undefined
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const user = session?.user
      if (!user) return
      try {
        const ok = await isAdminUser(user.id)
        if (ok) navigate('/admin', { replace: true })
      } catch {
        /* ignore */
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!supabase) {
      toast.error(
        isSupabaseConfigured()
          ? 'Supabase client failed to initialize. Check env vars and redeploy.'
          : 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      )
      return
    }
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error
      const uid = data.user?.id
      const ok = await isAdminUser(uid)
      if (!ok) {
        await supabase.auth.signOut()
        toast.error(
          'Signed in, but this user is not in public.admins. Add a row with user_id = your auth user UUID.'
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

  const configured = isSupabaseConfigured() && supabase

  return (
    <AdminShell
      title="Admin login"
      subtitle="Sign in with a Supabase Auth user that is listed in public.admins."
      rightSlot={null}
    >
      <div className="admin-login">
        <div className="admin-login-card card">
          <h2 style={{ marginBottom: '8px' }}>Admin Login</h2>
          {!configured && (
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
              Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel → Environment Variables, then
              redeploy.
            </p>
          )}
          <p style={{ color: 'var(--gray-dark)', marginBottom: '12px' }}>
            Uses <strong>Supabase Auth</strong> (email/password). Create users under Supabase → Authentication.
          </p>
          <p
            className="review-hint admin-login-hint"
            style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--gray-dark)' }}
          >
            <strong>Admin access</strong>: Table <code>public.admins</code> — add one row with{' '}
            <code>user_id</code> equal to the user&apos;s UUID from Authentication → Users.
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
