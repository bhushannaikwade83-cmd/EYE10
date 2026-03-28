import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { MapPin, Phone, Mail, MessageSquare, User, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { saveLastInquiryContact } from '../utils/inquiryContact'
import { useSiteContent } from '../context/SiteContentContext'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { getSitePhone, getSiteEmail, getSiteAddress, getSiteWhatsAppDigits } from '../utils/siteContact'
import EnquiryForm from '../components/EnquiryForm'
import './Contact.css'

function Contact() {
  const { content } = useSiteContent()
  const displayPhone = getSitePhone(content)
  const displayEmail = getSiteEmail(content)
  const displayAddress = getSiteAddress(content)
  const telHref = `tel:${displayPhone.replace(/\s+/g, '')}`
  const mailHref = `mailto:${displayEmail}`
  const whatsappUrl = buildWhatsAppUrl(getSiteWhatsAppDigits(content) || content?.contact?.whatsappNumber)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
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

    if (!db) {
      toast.error('Enquiry form needs Firebase. Configure VITE_FIREBASE_* on this deployment.')
      setLoading(false)
      return
    }

    try {
      await addDoc(collection(db, 'enquiries'), {
        ...formData,
        type: 'general',
        createdAt: serverTimestamp(),
        status: 'new',
      })

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
      })
    } catch (error) {
      console.error('Error submitting enquiry:', error)
      toast.error('Failed to submit enquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="contact-page">
        <div className="container">
          <h1>Get in Touch</h1>
          <p className="contact-subtitle">
            Contact us for any information or enquiries about our premium eyewear collection
          </p>

          <div className="contact-layout">
            <div className="contact-info">
              <div className="info-card">
                <MapPin size={32} className="info-icon" />
                <h3>Visit Us</h3>
                <p className="contact-address-block">{displayAddress}</p>
              </div>

              <div className="info-card">
                <Phone size={32} className="info-icon" />
                <h3>Call Us</h3>
                <p>
                  <a href={telHref} className="branch-phone">
                    {displayPhone}
                  </a>
                </p>
              </div>

              <div className="info-card">
                <Mail size={32} className="info-icon" />
                <h3>Email Us</h3>
                <p>
                  <a href={mailHref}>{displayEmail}</a>
                </p>
              </div>

              <div className="info-card">
                <MessageSquare size={32} className="info-icon" />
                <h3>WhatsApp</h3>
                <p>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="branch-phone">
                    Chat on WhatsApp
                  </a>
                </p>
              </div>

              <div className="info-card">
                <Clock size={32} className="info-icon" />
                <h3>Business Hours</h3>
                <p>
                  <strong>Monday - Saturday:</strong><br />
                  10:00 AM - 8:00 PM<br />
                  <strong>Sunday:</strong><br />
                  11:00 AM - 6:00 PM
                </p>
              </div>
            </div>

            <div className="contact-form-section">
              <div className="form-card">
                <h2>Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="contact-form">
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
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="input"
                      rows="5"
                      placeholder="Tell us about your requirements or any questions..."
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
          </div>
        </div>
      </div>
    </main>
  )
}

export default Contact
