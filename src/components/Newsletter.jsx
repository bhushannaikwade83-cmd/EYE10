import { useState } from 'react'
import { Mail, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import './Newsletter.css'

function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    // Save to localStorage
    const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]')
    if (subscribers.includes(email)) {
      toast.error('You are already subscribed!')
      return
    }

    subscribers.push(email)
    localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers))
    setSubscribed(true)
    setEmail('')
    toast.success('Thank you for subscribing!')
  }

  if (subscribed) {
    return (
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-success">
            <Check size={48} className="success-icon" />
            <h3>Thank You for Subscribing!</h3>
            <p>You'll receive our latest offers and updates.</p>
            <button onClick={() => setSubscribed(false)} className="btn-resubscribe">
              Subscribe Another Email
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-content">
          <div className="newsletter-icon">
            <Mail size={48} />
          </div>
          <div className="newsletter-text">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for exclusive offers, new arrivals, and eyewear tips.</p>
          </div>
          <form onSubmit={handleSubmit} className="newsletter-form">
            <div className="newsletter-input-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
                required
              />
            </div>
            <button type="submit" className="btn-subscribe">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
