import { useState, useMemo } from 'react'
import { Search, X, Grid, List, ArrowUpDown, Filter } from 'lucide-react'
import './ProductFilters.css'

function ProductFilters({ products, onFilterChange, onSortChange, onViewChange, currentView = 'grid' }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]
    return cats
  }, [products])

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' },
  ]

  const applyFilters = (term, category, range, sort) => {
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

    // Sort
    if (sort !== 'default') {
      switch (sort) {
        case 'price-low':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
          break
        case 'price-high':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
          break
        case 'name-asc':
          filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          break
        case 'name-desc':
          filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
          break
        case 'newest':
          filtered.sort((a, b) => (b.id || '').localeCompare(a.id || ''))
          break
        default:
          break
      }
    }

    onFilterChange(filtered)
    if (onSortChange) {
      onSortChange(sort)
    }
  }

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    applyFilters(term, selectedCategory, priceRange, sortBy)
  }

  const handleCategoryChange = (e) => {
    const category = e.target.value
    setSelectedCategory(category)
    applyFilters(searchTerm, category, priceRange, sortBy)
  }

  const handlePriceChange = (e) => {
    const range = e.target.value
    setPriceRange(range)
    applyFilters(searchTerm, selectedCategory, range, sortBy)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setShowSortMenu(false)
    applyFilters(searchTerm, selectedCategory, priceRange, value)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setPriceRange('all')
    setSortBy('default')
    applyFilters('', 'all', 'all', 'default')
  }

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || priceRange !== 'all' || sortBy !== 'default'

  return (
    <div className="product-filters">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={20} />
          <span>Filters & Sort</span>
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="clear-all-btn">
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      <div className="filters-content">
        {/* Search Bar */}
        <div className="filter-section">
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => {
                setSearchTerm('')
                applyFilters('', selectedCategory, priceRange, sortBy)
              }} className="clear-search">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label>Category</label>
              <select 
                value={selectedCategory} 
                onChange={handleCategoryChange} 
                className="filter-select"
                aria-label="Filter by category"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <select 
                value={priceRange} 
                onChange={handlePriceChange} 
                className="filter-select"
                aria-label="Filter by price range"
              >
                <option value="all">All Prices</option>
                <option value="under-5000">Under ₹5,000</option>
                <option value="5000-10000">₹5,000 - ₹10,000</option>
                <option value="10000-20000">₹10,000 - ₹20,000</option>
                <option value="above-20000">Above ₹20,000</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <div className="sort-controls">
                <button
                  className="sort-btn"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  aria-label="Sort products"
                  aria-expanded={showSortMenu}
                  aria-haspopup="true"
                >
                  <ArrowUpDown size={16} />
                  <span>{sortOptions.find((opt) => opt.value === sortBy)?.label}</span>
                </button>
                {showSortMenu && (
                  <div className="sort-menu">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                        onClick={() => handleSortChange(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-group">
              <label>View</label>
              <div className="view-controls">
                <button
                  className={`view-btn ${currentView === 'grid' ? 'active' : ''}`}
                  onClick={() => onViewChange('grid')}
                  title="Grid View"
                  aria-label="Switch to grid view"
                  aria-pressed={currentView === 'grid'}
                >
                  <Grid size={18} />
                </button>
                <button
                  className={`view-btn ${currentView === 'list' ? 'active' : ''}`}
                  onClick={() => onViewChange('list')}
                  title="List View"
                  aria-label="Switch to list view"
                  aria-pressed={currentView === 'list'}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductFilters
