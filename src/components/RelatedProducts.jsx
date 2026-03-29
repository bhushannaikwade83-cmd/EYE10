import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import ProductCard from './ProductCard'
import './RelatedProducts.css'

function RelatedProducts({ currentProduct }) {
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentProduct) {
      setRelatedProducts([])
      setLoading(false)
      return
    }

    const fetchRelatedProducts = async () => {
      if (!supabase) {
        setRelatedProducts([])
        setLoading(false)
        return
      }
      try {
        const { data: rows, error } = await supabase.from('products').select('id, data').limit(120)
        if (error) throw error
        const all = (rows || []).map((r) => ({
          id: r.id,
          ...(r.data && typeof r.data === 'object' ? r.data : {}),
        }))
        let pool = all.filter((p) => p.id !== currentProduct?.id)
        if (currentProduct?.category) {
          pool = pool.filter((p) => p.category === currentProduct.category)
        } else if (currentProduct?.brand) {
          pool = pool.filter((p) => p.brand === currentProduct.brand)
        }
        const products = pool.slice(0, 4)

        setRelatedProducts(products)
      } catch (error) {
        console.error('Error fetching related products:', error)
        setRelatedProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProduct])

  if (loading || relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="related-products">
      <div className="container">
        <h2 className="section-title">You May Also Like</h2>
        <div className="related-products-grid">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RelatedProducts
