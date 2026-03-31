import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase/client'
import { isAdminUser } from '../utils/adminAccess'

function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured()) {
      setChecking(false)
      return undefined
    }

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      const u = data.session?.user ?? null
      setUser(u)
      if (!u) {
        setIsAdmin(false)
        setChecking(false)
        return
      }
      try {
        const ok = await isAdminUser(u.id)
        setIsAdmin(ok)
      } catch {
        setIsAdmin(false)
      } finally {
        setChecking(false)
      }
    }

    void checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) {
        setIsAdmin(false)
        setChecking(false)
        return
      }
      try {
        const ok = await isAdminUser(u.id)
        setIsAdmin(ok)
      } catch {
        setIsAdmin(false)
      } finally {
        setChecking(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (checking) {
    return (
      <main>
        <div className="container" style={{ paddingTop: '160px', textAlign: 'center' }}>
          Checking admin session...
        </div>
      </main>
    )
  }

  if (!supabase || !isSupabaseConfigured()) {
    return <Navigate to="/admin/login" replace state={{ supabaseMissing: true }} />
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ adminDenied: true }} />
  }

  return children
}

export default AdminRoute
