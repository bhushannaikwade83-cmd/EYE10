// Utility functions for localStorage operations

export const getRecentlyViewed = () => {
  try {
    const items = localStorage.getItem('recentlyViewed')
    return items ? JSON.parse(items) : []
  } catch (error) {
    console.error('Error reading recently viewed:', error)
    return []
  }
}

export const addToRecentlyViewed = (product) => {
  try {
    let items = getRecentlyViewed()
    
    // Remove if already exists
    items = items.filter(item => item.id !== product.id)
    
    // Add to beginning
    items.unshift({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price || product.currentPrice,
      viewedAt: new Date().toISOString(),
    })
    
    // Keep only last 10 items
    items = items.slice(0, 10)
    
    localStorage.setItem('recentlyViewed', JSON.stringify(items))
  } catch (error) {
    console.error('Error saving recently viewed:', error)
  }
}

export const getWishlist = () => {
  try {
    const items = localStorage.getItem('wishlist')
    return items ? JSON.parse(items) : []
  } catch (error) {
    console.error('Error reading wishlist:', error)
    return []
  }
}

export const addToWishlist = (product) => {
  try {
    let items = getWishlist()
    
    // Check if already in wishlist
    if (items.some(item => item.id === product.id)) {
      return false // Already in wishlist
    }
    
    items.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price || product.currentPrice,
      addedAt: new Date().toISOString(),
    })
    
    localStorage.setItem('wishlist', JSON.stringify(items))
    return true // Successfully added
  } catch (error) {
    console.error('Error saving wishlist:', error)
    return false
  }
}

export const removeFromWishlist = (productId) => {
  try {
    let items = getWishlist()
    items = items.filter(item => item.id !== productId)
    localStorage.setItem('wishlist', JSON.stringify(items))
    return true
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return false
  }
}

export const isInWishlist = (productId) => {
  try {
    const items = getWishlist()
    return items.some(item => item.id === productId)
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return false
  }
}
