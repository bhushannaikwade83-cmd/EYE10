import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from './ProductCard'
import './RelatedProducts.css'

function RelatedProducts({ currentProduct }) {
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!db) {
        setRelatedProducts(getSampleRelatedProducts(currentProduct))
        setLoading(false)
        return
      }
      try {
        let q
        if (currentProduct?.category) {
          q = query(
            collection(db, 'products'),
            where('category', '==', currentProduct.category),
            limit(4)
          )
        } else if (currentProduct?.brand) {
          q = query(
            collection(db, 'products'),
            where('brand', '==', currentProduct.brand),
            limit(4)
          )
        } else {
          q = query(collection(db, 'products'), limit(4))
        }

        const snapshot = await getDocs(q)
        const products = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((p) => p.id !== currentProduct?.id)
          .slice(0, 4)

        if (products.length === 0) {
          setRelatedProducts(getSampleRelatedProducts(currentProduct))
        } else {
          setRelatedProducts(products)
        }
      } catch (error) {
        console.error('Error fetching related products:', error)
        setRelatedProducts(getSampleRelatedProducts(currentProduct))
      } finally {
        setLoading(false)
      }
    }

    if (currentProduct) {
      fetchRelatedProducts()
    }
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

function getSampleRelatedProducts(currentProduct) {
  const allProducts = [
    {
      id: '1',
      name: 'Classic Aviator Sunglasses',
      price: 2999,
      originalPrice: 3999,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'EYE10',
      discount: 25,
    },
    {
      id: '2',
      name: 'Round Frame Glasses',
      price: 2499,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'EYE10',
      discount: 17,
    },
    {
      id: '3',
      name: 'Cat Eye Sunglasses',
      price: 3499,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'sunglasses',
      brand: 'Ray-Ban',
    },
    {
      id: '4',
      name: 'Square Frame Glasses',
      price: 2199,
      image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
      category: 'glasses',
      brand: 'EYE10',
    },
  ]

  return allProducts
    .filter((p) => p.id !== currentProduct?.id)
    .filter(
      (p) =>
        p.category === currentProduct?.category ||
        p.brand === currentProduct?.brand
    )
    .slice(0, 4)
}

export default RelatedProducts
