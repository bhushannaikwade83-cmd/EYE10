import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import './Breadcrumbs.css'

function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const getBreadcrumbName = (path) => {
    const names = {
      products: 'Products',
      product: 'Product Details',
      contact: 'Contact Us',
      cart: 'Shopping Cart',
      checkout: 'Checkout',
    }
    return names[path] || path.charAt(0).toUpperCase() + path.slice(1)
  }

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0 || location.pathname === '/') {
    useEffect(() => {
      document.body.classList.remove('has-breadcrumbs')
    }, [])
    return null
  }

  // Add class to body when breadcrumbs are present for CSS targeting
  useEffect(() => {
    document.body.classList.add('has-breadcrumbs')
    return () => {
      document.body.classList.remove('has-breadcrumbs')
    }
  }, [location.pathname])

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <div className="container">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <Link to="/" className="breadcrumb-link">
              <Home size={16} />
              <span>Home</span>
            </Link>
          </li>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
            const isLast = index === pathnames.length - 1
            const displayName = getBreadcrumbName(name)

            return (
              <li key={routeTo} className="breadcrumb-item">
                <ChevronRight size={16} className="breadcrumb-separator" />
                {isLast ? (
                  <span className="breadcrumb-current" aria-current="page">
                    {displayName}
                  </span>
                ) : (
                  <Link to={routeTo} className="breadcrumb-link">
                    {displayName}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

export default Breadcrumbs
