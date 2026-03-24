import { useState, useEffect } from 'react'
import { GitCompare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './ComparisonButton.css'

function ComparisonButton() {
  const [comparisonCount, setComparisonCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem('comparisonProducts')
      const products = saved ? JSON.parse(saved) : []
      setComparisonCount(products.length)
    }

    updateCount()
    // Listen for storage changes
    window.addEventListener('storage', updateCount)
    // Custom event for same-tab updates
    window.addEventListener('comparisonUpdated', updateCount)

    // Poll for changes (in case localStorage is updated directly)
    const interval = setInterval(updateCount, 500)

    return () => {
      window.removeEventListener('storage', updateCount)
      window.removeEventListener('comparisonUpdated', updateCount)
      clearInterval(interval)
    }
  }, [])

  const handleClick = () => {
    // Trigger the floating comparison button click
    const comparisonToggle = document.querySelector('.comparison-toggle')
    if (comparisonToggle) {
      comparisonToggle.click()
    } else {
      // If no products, show message
      if (comparisonCount === 0) {
        alert('No products in comparison. Add products using the Compare button on product cards.')
      }
    }
  }

  if (comparisonCount === 0) {
    return (
      <button
        className="comparison-nav-button comparison-nav-button-empty"
        onClick={handleClick}
        aria-label="View comparison"
        title="No products in comparison. Add products to compare."
      >
        <GitCompare size={18} />
        <span className="comparison-nav-text">Compare</span>
      </button>
    )
  }

  return (
    <button
      className="comparison-nav-button"
      onClick={handleClick}
      aria-label={`Compare ${comparisonCount} product${comparisonCount > 1 ? 's' : ''}`}
      title={`Compare ${comparisonCount} product${comparisonCount > 1 ? 's' : ''}`}
    >
      <GitCompare size={18} />
      <span className="comparison-nav-count">{comparisonCount}</span>
      <span className="comparison-nav-text">Compare</span>
    </button>
  )
}

export default ComparisonButton
