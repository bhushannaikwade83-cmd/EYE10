import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import EventBanner from './components/EventBanner'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Breadcrumbs from './components/Breadcrumbs'
import ProductComparison from './components/ProductComparison'
import PrivacyConsent from './components/PrivacyConsent'
import PriceDropAlerts from './components/PriceDropAlerts'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'
import AdminLogin from './admin/AdminLogin'
import AdminPanel from './admin/AdminPanel'
import AdminRoute from './admin/AdminRoute'
import './App.css'

function AppChrome() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="App app-3d">
      <div className="three-scene" aria-hidden="true">
        <span className="three-orb orb-1" />
        <span className="three-orb orb-2" />
        <span className="three-orb orb-3" />
        <span className="three-grid" />
      </div>

      {!isAdminRoute ? (
        <>
          <Navbar />
          <EventBanner />
          <Breadcrumbs />
        </>
      ) : null}

      <main id="main-content" tabIndex={-1} className={isAdminRoute ? 'main--admin' : undefined}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>

      {!isAdminRoute ? <Footer /> : null}

      <ProductComparison />
      <PriceDropAlerts />
      <PrivacyConsent />
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            color: '#1a1a1a',
            borderRadius: '12px',
            border: '2px solid rgba(181, 138, 42, 0.18)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            padding: '16px 20px',
            fontFamily: "'Inter', 'Poppins', sans-serif",
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppChrome />
    </Router>
  )
}

export default App
