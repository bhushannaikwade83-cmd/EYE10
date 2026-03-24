import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import './ProductSearch.css'

function ProductSearch({ products, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]
    return cats
  }, [products])

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    applyFilters(term, selectedCategory, priceRange)
  }

  const handleCategoryChange = (e) => {
    const category = e.target.value
    setSelectedCategory(category)
    applyFilters(searchTerm, category, priceRange)
  }

  const handlePriceChange = (e) => {
    const range = e.target.value
    setPriceRange(range)
    applyFilters(searchTerm, selectedCategory, range)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setPriceRange('all')
    applyFilters('', 'all', 'all')
  }

  const applyFilters = (term, category, range) => {
    let filtered = [...products]

    // Search filter
    if (term) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(term.toLowerCase()) ||
          product.brand?.toLowerCase().includes(term.toLowerCase()) ||
          product.description?.toLowerCase().includes(term.toLowerCase())
      )
    }

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter((product) => product.category === category)
    }

    // Price filter
    if (range !== 'all') {
      filtered = filtered.filter((product) => {
        const price = product.price || product.currentPrice || 0
        switch (range) {
          case 'under-5000':
            return price < 5000
          case '5000-10000':
            return price >= 5000 && price <= 10000
          case '10000-20000':
            return price > 10000 && price <= 20000
          case 'above-20000':
            return price > 20000
          default:
            return true
        }
      })
    }

    onFilterChange(filtered)
  }

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || priceRange !== 'all'

  return (
    <div className="product-search">
      <div className="search-bar-wrapper">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search products, brands, or descriptions..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label>Category</label>
          <select value={selectedCategory} onChange={handleCategoryChange} className="filter-select">
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Price Range</label>
          <select value={priceRange} onChange={handlePriceChange} className="filter-select">
            <option value="all">All Prices</option>
            <option value="under-5000">Under ₹5,000</option>
            <option value="5000-10000">₹5,000 - ₹10,000</option>
            <option value="10000-20000">₹10,000 - ₹20,000</option>
            <option value="above-20000">Above ₹20,000</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductSearch
