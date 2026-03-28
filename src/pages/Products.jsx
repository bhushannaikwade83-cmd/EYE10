import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import { Filter, X, FileText } from 'lucide-react'
import { getSampleProducts } from '../utils/sampleProducts'
import { useSiteContent } from '../context/SiteContentContext'
import { getCatalogueItems, openCataloguePdfInNewTabAndDownload } from '../utils/catalogue'
import './Products.css'

function Products() {
  const { content } = useSiteContent()
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
      if (!db) {
        const sampleProducts = getSampleProducts()
        setProducts(sampleProducts)
        setFilteredProducts(sampleProducts)
        setLoading(false)
        return
      }
      try {
        const q = query(collection(db, 'products'))
        const snapshot = await getDocs(q)
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
        setFilteredProducts([])
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

  const catalogueItems = getCatalogueItems(content)

  return (
    <main>
      <div className="products-page">
        <div className="container">
          <div className="products-header">
            <h1>{content?.productsPage?.title || 'Our Products'}</h1>
            <p className="products-subtitle">
              {content?.productsPage?.subtitle || 'Discover our premium eyewear collection'}
            </p>
          </div>

          {catalogueItems.length > 0 ? (
            <div className="products-catalogue-banner">
              <p>Browse the full frame &amp; lens catalogue (PDF).</p>
              <div className="products-catalogue-links">
                {catalogueItems.map((item) => (
                  <a
                    key={item.id}
                    className="btn btn-outline products-catalogue-link"
                    href={item.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault()
                      void openCataloguePdfInNewTabAndDownload(item)
                    }}
                  >
                    <FileText size={18} aria-hidden />
                    {(item.title || item.brandName || 'Catalogue').trim() || 'Catalogue'}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          
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
              ) : products.length === 0 ? (
                <div className="no-products">
                  <h2>No products published yet</h2>
                  <p>
                    Add documents to the <code>products</code> collection in Firebase. The storefront only
                    shows data from your backend.
                  </p>
                </div>
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

export default Products
