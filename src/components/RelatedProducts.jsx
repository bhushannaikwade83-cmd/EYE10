import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
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
      if (!db) {
        setRelatedProducts([])
        setLoading(false)
        return
      }
      try {
        let q
        if (currentProduct?.category) {
          q = query(
            collection(db, 'products'),
            where('category', '==', currentProduct.category),
            limit(8)
          )
        } else if (currentProduct?.brand) {
          q = query(
            collection(db, 'products'),
            where('brand', '==', currentProduct.brand),
            limit(8)
          )
        } else {
          q = query(collection(db, 'products'), limit(8))
        }

        const snapshot = await getDocs(q)
        const products = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((p) => p.id !== currentProduct?.id)
          .slice(0, 4)

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
