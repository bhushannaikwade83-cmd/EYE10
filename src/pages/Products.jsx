import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import { Filter, X } from 'lucide-react'
import './Products.css'

function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    brand: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'))
        const snapshot = await getDocs(q)
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        
        if (productsData.length === 0) {
          // Fallback to sample data
          productsData.push(...getSampleProducts())
        }
        
        setProducts(productsData)
        // Initialize filtered products
        setFilteredProducts(productsData)
      } catch (error) {
        console.error('Error fetching products:', error)
        // Fallback to sample data
        const sampleProducts = getSampleProducts()
        setProducts(sampleProducts)
        // Initialize filtered products
        setFilteredProducts(sampleProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Note: ProductSearch component now handles filtering
  // This effect is kept for URL search params compatibility
  // Initialize filtered products when products load
  useEffect(() => {
    if (products.length > 0 && filteredProducts.length === 0) {
      setFilteredProducts(products)
    }
  }, [products])

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))]


  return (
    <main>
      <div className="products-page">
        <div className="container">
          <div className="products-header">
            <h1>Our Products</h1>
            <p className="products-subtitle">Discover our premium eyewear collection</p>
          </div>
          
          {!loading && products.length > 0 && (
            <ProductFilters
              products={products}
              onFilterChange={setFilteredProducts}
              onViewChange={setViewMode}
              currentView={viewMode}
            />
          )}

          <div className={`products-layout ${!showFilters ? 'products-layout-full' : ''}`}>
            {/* Legacy filter sidebar - kept for compatibility but ProductSearch is primary */}
            {showFilters && products.length > 0 && (
              <aside className="filters-sidebar">
                <div className="filters-header">
                  <h2>Filters</h2>
                  <button
                    className="close-filters"
                    onClick={() => setShowFilters(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="filter-group">
                  <h3>Category</h3>
                  <div className="filter-options">
                    <label>
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={filters.category === ''}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                      />
                      All Categories
                    </label>
                    {categories.map((cat) => (
                      <label key={cat}>
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={filters.category === cat}
                          onChange={(e) =>
                            setFilters({ ...filters, category: e.target.value })
                          }
                        />
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h3>Price Range</h3>
                  <div className="filter-options">
                    <label>
                      <input
                        type="radio"
                        name="priceRange"
                        value=""
                        checked={filters.priceRange === ''}
                        onChange={(e) =>
                          setFilters({ ...filters, priceRange: e.target.value })
                        }
                      />
                      All Prices
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="priceRange"
                        value="0-2000"
                        checked={filters.priceRange === '0-2000'}
                        onChange={(e) =>
                          setFilters({ ...filters, priceRange: e.target.value })
                        }
                      />
                      Under ₹2,000
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="priceRange"
                        value="2000-5000"
                        checked={filters.priceRange === '2000-5000'}
                        onChange={(e) =>
                          setFilters({ ...filters, priceRange: e.target.value })
                        }
                      />
                      ₹2,000 - ₹5,000
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="priceRange"
                        value="5000-10000"
                        checked={filters.priceRange === '5000-10000'}
                        onChange={(e) =>
                          setFilters({ ...filters, priceRange: e.target.value })
                        }
                      />
                      ₹5,000 - ₹10,000
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="priceRange"
                        value="10000-"
                        checked={filters.priceRange === '10000-'}
                        onChange={(e) =>
                          setFilters({ ...filters, priceRange: e.target.value })
                        }
                      />
                      Above ₹10,000
                    </label>
                  </div>
                </div>

                {brands.length > 0 && (
                  <div className="filter-group">
                    <h3>Brand</h3>
                    <div className="filter-options">
                      <label>
                        <input
                          type="radio"
                          name="brand"
                          value=""
                          checked={filters.brand === ''}
                          onChange={(e) =>
                            setFilters({ ...filters, brand: e.target.value })
                          }
                        />
                        All Brands
                      </label>
                      {brands.map((brand) => (
                        <label key={brand}>
                          <input
                            type="radio"
                            name="brand"
                            value={brand}
                            checked={filters.brand === brand}
                            onChange={(e) =>
                              setFilters({ ...filters, brand: e.target.value })
                            }
                          />
                          {brand}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary clear-filters"
                  onClick={() =>
                    setFilters({ category: '', priceRange: '', brand: '' })
                  }
                >
                  Clear All Filters
                </button>
              </aside>
            )}

            <div className="products-content">
              {loading ? (
                <div className="loading">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="no-products">
                  <h2>No products found</h2>
                  <p>Try adjusting your filters or search query</p>
                </div>
              ) : (
                <>
                  {filteredProducts.length !== products.length ? (
                    <div className="products-count">
                      Showing {filteredProducts.length} of {products.length} product(s)
                    </div>
                  ) : (
                    <div className="products-count">
                      {products.length} product{products.length !== 1 ? 's' : ''} available
                    </div>
                  )}
                  <div className={`products-${viewMode} ${viewMode === 'list' ? 'products-list-view' : ''}`}>
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function getSampleProducts() {
  return [
    {
      id: '1',
      name: 'Classic Aviator Sunglasses',
      price: 2999,
      originalPrice: 3999,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'EYE10',
      discount: 25,
      description: 'Timeless aviator design with UV protection and premium metal frame.',
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
      description: 'Vintage-inspired round frames perfect for a classic look.',
    },
    {
      id: '3',
      name: 'Cat Eye Sunglasses',
      price: 3499,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'sunglasses',
      brand: 'Ray-Ban',
      description: 'Elegant cat-eye design with polarized lenses and stylish frame.',
    },
    {
      id: '4',
      name: 'Square Frame Glasses',
      price: 2199,
      image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
      category: 'glasses',
      brand: 'EYE10',
      description: 'Modern square frames with anti-glare coating and lightweight design.',
    },
    {
      id: '5',
      name: 'Wayfarer Sunglasses',
      price: 2799,
      originalPrice: 3499,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Oakley',
      discount: 20,
      description: 'Iconic wayfarer style with durable acetate frame and UV400 protection.',
    },
    {
      id: '6',
      name: 'Oval Frame Glasses',
      price: 2299,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'EYE10',
      description: 'Comfortable oval frames with blue light filter technology.',
    },
    {
      id: '7',
      name: 'Rimless Glasses',
      price: 1899,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
      category: 'glasses',
      brand: 'Gucci',
      discount: 24,
      description: 'Ultra-lightweight rimless design for maximum comfort and style.',
    },
    {
      id: '8',
      name: 'Sport Sunglasses',
      price: 4499,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Oakley',
      description: 'High-performance sports sunglasses with impact-resistant lenses.',
    },
    {
      id: '9',
      name: 'Browline Glasses',
      price: 2699,
      originalPrice: 3299,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'Prada',
      discount: 18,
      description: 'Sophisticated browline frames combining metal and acetate materials.',
    },
    {
      id: '10',
      name: 'Oversized Sunglasses',
      price: 3799,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Versace',
      description: 'Luxury oversized sunglasses with gradient lenses and designer frame.',
    },
  ]
}

export default Products
