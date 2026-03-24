import { useState, useEffect } from 'react'
import { Star, MessageSquare, ThumbsUp } from 'lucide-react'
import toast from 'react-hot-toast'
import './ProductReviews.css'

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: '',
  })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`reviews_${productId}`)
    if (saved) {
      setReviews(JSON.parse(saved))
    }
  }, [productId])

  const saveReviews = (updatedReviews) => {
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(updatedReviews))
    setReviews(updatedReviews)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newReview.name || !newReview.comment) {
      toast.error('Please fill in all required fields')
      return
    }

    const review = {
      id: Date.now(),
      ...newReview,
      date: new Date().toLocaleDateString(),
      helpful: 0,
    }

    const updatedReviews = [...reviews, review]
    saveReviews(updatedReviews)
    setNewReview({ name: '', email: '', rating: 5, comment: '' })
    setShowForm(false)
    toast.success('Thank you for your review!')
  }

  const handleHelpful = (reviewId) => {
    const updatedReviews = reviews.map((review) =>
      review.id === reviewId
        ? { ...review, helpful: review.helpful + 1 }
        : review
    )
    saveReviews(updatedReviews)
    toast.success('Thanks for your feedback!')
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

  return (
    <section className="product-reviews">
      <div className="reviews-header">
        <h3>
          <MessageSquare size={24} />
          Customer Reviews ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="average-rating">
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={star <= averageRating ? 'filled' : ''}
                />
              ))}
            </div>
            <span className="rating-text">
              {averageRating.toFixed(1)} out of 5
            </span>
          </div>
        )}
      </div>

      <button
        className="btn-add-review"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Write a Review'}
      </button>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={newReview.name}
              onChange={(e) =>
                setNewReview({ ...newReview, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={newReview.email}
              onChange={(e) =>
                setNewReview({ ...newReview, email: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Rating *</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= newReview.rating ? 'active' : ''}`}
                  onClick={() =>
                    setNewReview({ ...newReview, rating: star })
                  }
                >
                  <Star size={24} />
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Your Review *</label>
            <textarea
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              rows="4"
              required
            />
          </div>
          <button type="submit" className="btn-submit-review">
            Submit Review
          </button>
        </form>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews
            .sort((a, b) => b.id - a.id)
            .map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div>
                    <h4>{review.name}</h4>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= review.rating ? 'filled' : ''}
                      />
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <button
                  className="helpful-btn"
                  onClick={() => handleHelpful(review.id)}
                >
                  <ThumbsUp size={16} />
                  Helpful ({review.helpful})
                </button>
              </div>
            ))
        )}
      </div>
    </section>
  )
}

export default ProductReviews
