import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'
import './NotFound.css'

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-message">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <div className="error-actions">
            <Link to="/" className="btn btn-primary">
              <Home size={20} />
              Go Home
            </Link>
            <Link to="/products" className="btn btn-outline">
              <Search size={20} />
              Browse Products
            </Link>
            <button onClick={() => window.history.back()} className="btn btn-secondary">
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
