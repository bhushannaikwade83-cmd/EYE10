import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import { getRecentlyViewed } from '../utils/localStorage'
import ProductCard from './ProductCard'
import './RecentlyViewed.css'

function RecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState([])

  useEffect(() => {
    const recent = getRecentlyViewed()
    setRecentProducts(recent)
  }, [])

  if (recentProducts.length === 0) {
    return null
  }

  return (
    <section className="recently-viewed-section">
      <div className="container">
        <div className="section-header">
          <div className="section-title-wrapper">
            <Clock className="section-icon" size={24} />
            <h2>Recently Viewed</h2>
          </div>
          <Link to="/products" className="view-all">
            View All <ArrowRight size={20} />
          </Link>
        </div>
        <div className="products-grid">
          {recentProducts.slice(0, 4).map((item) => (
            <ProductCard 
              key={item.id} 
              product={{
                ...item,
                currentPrice: item.price,
              }} 
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecentlyViewed
