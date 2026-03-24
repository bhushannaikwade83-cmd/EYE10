import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { auth } from '../firebase/config'
import { isFirestoreAdmin } from '../utils/adminAccess'

function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        setIsAdmin(false)
        setChecking(false)
        return
      }
      try {
        const ok = await isFirestoreAdmin(currentUser.uid)
        setIsAdmin(ok)
      } catch {
        setIsAdmin(false)
      } finally {
        setChecking(false)
      }
    })

    return () => unsub()
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

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ adminDenied: true }} />
  }

  return children
}

export default AdminRoute
