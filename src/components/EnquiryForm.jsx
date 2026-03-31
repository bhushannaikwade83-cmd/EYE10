import { useState } from 'react'
import { supabase } from '../supabase/client'
import toast from 'react-hot-toast'
import { saveLastInquiryContact } from '../utils/inquiryContact'
import { User, Phone, Mail, MessageSquare, X } from 'lucide-react'
import './EnquiryForm.css'

function EnquiryForm({ product, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    productName: product?.name || '',
    productId: product?.id || '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!supabase) {
      toast.error('Enquiry service is temporarily unavailable. Please try again shortly.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.from('enquiries').insert({
        data: {
          ...formData,
          createdAt: new Date().toISOString(),
          status: 'new',
        },
      })
      if (error) throw error

      toast.success('Enquiry submitted successfully! We will contact you soon.')
      saveLastInquiryContact({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      })
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: '',
        productName: product?.name || '',
        productId: product?.id || '',
      })
      if (onClose) onClose()
    } catch (error) {
      console.error('Error submitting enquiry:', error)
      toast.error('We could not submit your enquiry right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="enquiry-form-overlay" onClick={onClose}>
      <div className="enquiry-form-container" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        )}
        <h2>Enquire Now</h2>
        {product && (
          <p className="product-name">About: {product.name}</p>
        )}
        <form onSubmit={handleSubmit} className="enquiry-form">
          <div className="form-group">
            <label>
              <User size={18} />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Your Name"
              aria-label="Full Name"
            />
          </div>

          <div className="form-group">
            <label>
              <Phone size={18} />
              Contact Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input"
              placeholder="+91 99999 99999"
              aria-label="Contact Number"
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={18} />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>
              <MessageSquare size={18} />
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="input"
              rows="4"
              placeholder="Tell us about your requirements..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EnquiryForm
