import { useState } from 'react'
import { Grid, List, ArrowUpDown } from 'lucide-react'
import './ProductSortView.css'

function ProductSortView({ onSortChange, onViewChange, currentView = 'grid' }) {
  const [sortBy, setSortBy] = useState('default')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' },
  ]

  const handleSortChange = (value) => {
    setSortBy(value)
    setShowSortMenu(false)
    onSortChange(value)
  }

  return (
    <div className="product-sort-view">
      <div className="sort-controls">
        <button
          className="sort-btn"
          onClick={() => setShowSortMenu(!showSortMenu)}
        >
          <ArrowUpDown size={18} />
          <span>Sort: {sortOptions.find((opt) => opt.value === sortBy)?.label}</span>
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

      <div className="view-controls">
        <button
          className={`view-btn ${currentView === 'grid' ? 'active' : ''}`}
          onClick={() => onViewChange('grid')}
          title="Grid View"
        >
          <Grid size={20} />
        </button>
        <button
          className={`view-btn ${currentView === 'list' ? 'active' : ''}`}
          onClick={() => onViewChange('list')}
          title="List View"
        >
          <List size={20} />
        </button>
      </div>
    </div>
  )
}

export default ProductSortView
