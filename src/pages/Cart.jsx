import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { ProductImage } from '../components/ProductImage'
import './Cart.css'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart()
  const navigate = useNavigate()

  if (cartItems.length === 0) {
    return (
      <main>
        <div className="cart-page">
          <div className="container">
            <div className="empty-cart">
              <ShoppingBag size={80} className="empty-icon" />
              <h2>Your cart is empty</h2>
              <p>Add some products to get started!</p>
              <Link to="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>
          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <Link to={`/product/${item.id}`} className="cart-item-image">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      placeholder="https://via.placeholder.com/150"
                    />
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/product/${item.id}`}>
                      <h3>{item.name}</h3>
                    </Link>
                    <p className="cart-item-brand">{item.brand || 'EYE10'}</p>
                    <p className="cart-item-price">₹{item.price}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="cart-item-total">
                      ₹{item.price * item.quantity}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{getTotalPrice() >= 999 ? 'Free' : '₹99'}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{getTotalPrice() + (getTotalPrice() >= 999 ? 0 : 99)}</span>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn btn-primary checkout-btn"
                >
                  Proceed to Checkout
                </button>
                <Link to="/products" className="continue-shopping">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Cart
