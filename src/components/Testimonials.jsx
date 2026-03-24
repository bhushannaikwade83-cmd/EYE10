import { useEffect, useMemo, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import {
  GOOGLE_REVIEW_URL,
  getWebsiteReviews,
  WEBSITE_REVIEWS_UPDATED_EVENT,
} from '../utils/googleReviews'
import './Testimonials.css'

function Testimonials() {
  const fallbackTestimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Customer',
      image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=6366f1&color=fff',
      rating: 5,
      text: 'Excellent service! Found the perfect pair of glasses. The staff was very helpful and professional. Highly recommended!',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'Customer',
      image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=ec4899&color=fff',
      rating: 5,
      text: 'Best eyewear collection in town! Quality products and great prices. The virtual try-on feature helped me choose perfectly.',
    },
    {
      id: 3,
      name: 'Amit Patel',
      role: 'Customer',
      image: 'https://ui-avatars.com/api/?name=Amit+Patel&background=f59e0b&color=fff',
      rating: 5,
      text: 'Outstanding experience! From consultation to delivery, everything was smooth. The frames are stylish and comfortable.',
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      role: 'Customer',
      image: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=10b981&color=fff',
      rating: 5,
      text: 'Love my new sunglasses! Great quality, fast service, and the team really knows their products. Will definitely come back!',
    },
    {
      id: 5,
      name: 'Vikram Singh',
      role: 'Customer',
      image: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=8b5cf6&color=fff',
      rating: 5,
      text: 'Professional service and authentic products. The warranty and after-sales support is excellent. Worth every rupee!',
    },
    {
      id: 6,
      name: 'Anjali Mehta',
      role: 'Customer',
      image: 'https://ui-avatars.com/api/?name=Anjali+Mehta&background=14b8a6&color=fff',
      rating: 5,
      text: 'Amazing collection! Found exactly what I was looking for. The staff helped me choose the perfect frame for my face shape.',
    },
  ]

  const [googleReviews, setGoogleReviews] = useState([])
  const [websiteReviews, setWebsiteReviews] = useState([])
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)

  const loadWebsiteReviews = () => {
    const savedReviews = getWebsiteReviews().map((review) => ({
      id: `website-${review.id}`,
      name: review.name || 'Customer',
      role: 'Website Review',
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name || 'Customer')}&background=b58a2a&color=fff`,
      rating: review.rating || 5,
      text: review.text,
      source: 'Website',
    }))
    setWebsiteReviews(savedReviews)
  }

  useEffect(() => {
    loadWebsiteReviews()

    const refresh = () => loadWebsiteReviews()
    window.addEventListener(WEBSITE_REVIEWS_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener(WEBSITE_REVIEWS_UPDATED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_GOOGLE_REVIEWS_API_URL
    const googlePlacesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
    const googlePlaceIdRaw = import.meta.env.VITE_GOOGLE_PLACE_ID

    const normalizePlaceId = (value) => {
      if (!value) return ''
      return value.startsWith('places/') ? value : `places/${value}`
    }

    const normalizeReviews = (reviews) =>
      reviews.map((review, index) => ({
        id: review.id || review.name || `google-${index}`,
        name:
          review.author_name ||
          review.authorName ||
          review.authorAttribution?.displayName ||
          'Google User',
        role:
          review.relative_time_description ||
          review.relativeTimeDescription ||
          review.relativePublishTimeDescription ||
          'Google Review',
        image:
          review.profile_photo_url ||
          review.profilePhotoUrl ||
          review.authorAttribution?.photoUri ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            review.author_name ||
              review.authorName ||
              review.authorAttribution?.displayName ||
              'Google User'
          )}&background=c56a3a&color=fff`,
        rating: Number(review.rating) || 5,
        text: review.text?.text || review.text || '',
        source: 'Google',
      }))

    const fetchGoogleReviews = async () => {
      setIsLoadingGoogle(true)
      try {
        // Preferred mode: your own backend/proxy API endpoint
        if (apiUrl) {
          const response = await fetch(apiUrl)
          if (!response.ok) throw new Error('Failed to fetch Google reviews from proxy API')
          const data = await response.json()
          const reviews = Array.isArray(data?.reviews) ? data.reviews : []
          setGoogleReviews(normalizeReviews(reviews))
          return
        }

        // Direct mode: Google Places API (New)
        if (googlePlacesApiKey && googlePlaceIdRaw) {
          const placeId = normalizePlaceId(googlePlaceIdRaw)
          const url = `https://places.googleapis.com/v1/${placeId}?fields=reviews&key=${encodeURIComponent(
            googlePlacesApiKey
          )}`
          const response = await fetch(url)
          if (!response.ok) throw new Error('Failed to fetch Google reviews from Places API')
          const data = await response.json()
          const reviews = Array.isArray(data?.reviews) ? data.reviews : []
          setGoogleReviews(normalizeReviews(reviews))
          return
        }

        setGoogleReviews([])
      } catch (_) {
        setGoogleReviews([])
      } finally {
        setIsLoadingGoogle(false)
      }
    }

    fetchGoogleReviews()
  }, [])

  const testimonials = useMemo(() => {
    const preferred = [...googleReviews, ...websiteReviews]
    if (preferred.length > 0) return preferred.slice(0, 6)
    return fallbackTestimonials
  }, [googleReviews, websiteReviews])

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-title-wrapper">
          <Quote size={56} className="quote-icon" />
          <h2>Customer Reviews</h2>
          <p className="section-subtitle">
            {isLoadingGoogle
              ? 'Loading Google reviews...'
              : googleReviews.length > 0
              ? 'Live Google reviews and recent website feedback'
              : 'Google feed not configured yet. Showing website/customer reviews'}
          </p>
          {GOOGLE_REVIEW_URL && (
            <div className="google-review-actions">
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                View All On Google
              </a>
            </div>
          )}
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>
                    {testimonial.role}
                    {testimonial.source ? (
                      <span className="testimonial-source"> {testimonial.source}</span>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
