import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../supabase/client'
import { CreditCard, MapPin, Phone, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'
import './Checkout.css'

function Checkout() {
  const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
  })

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart')
    }

    if (!supabase) return undefined
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const user = session?.user
      if (user) {
        setFormData((prev) => ({
          ...prev,
          email: user.email || '',
          name:
            (user.user_metadata && user.user_metadata.full_name) ||
            user.email?.split('@')[0] ||
            '',
        }))
      }
    })
    return () => subscription.unsubscribe()
  }, [cartItems, navigate])

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
      toast.error('Orders are temporarily unavailable. Please try again shortly.')
      setLoading(false)
      return
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id ?? null
      const orderPayload = {
        userId: uid,
        items: cartItems,
        total: getTotalPrice() + (getTotalPrice() >= 999 ? 0 : 99),
        shipping: getTotalPrice() >= 999 ? 0 : 99,
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      const { error } = await supabase.from('orders').insert({ data: orderPayload })
      if (error) throw error

      // Clear cart
      clearCart()

      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('We could not place your order right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 999 ? 0 : 99
  const total = subtotal + shipping

  return (
    <main>
      <div className="checkout-page">
        <div className="container">
          <h1>Checkout</h1>
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-layout">
              <div className="checkout-form-section">
                <div className="form-section">
                  <h2>
                    <User size={20} />
                    Personal Information
                  </h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2>
                    <MapPin size={20} />
                    Delivery Address
                  </h2>
                  <div className="form-group">
                    <label>Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="input"
                      rows="3"
                    />
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h2>
                    <CreditCard size={20} />
                    Payment Method
                  </h2>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleChange}
                      />
                      <span>Cash on Delivery</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                      />
                      <span>Credit/Debit Card</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={formData.paymentMethod === 'upi'}
                        onChange={handleChange}
                      />
                      <span>UPI</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="checkout-summary">
                <div className="summary-card">
                  <h2>Order Summary</h2>
                  <div className="order-items">
                    {cartItems.map((item) => (
                      <div key={item.id} className="order-item">
                        <div className="order-item-info">
                          <span>{item.name}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="summary-row">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary place-order-btn"
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Checkout
