import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import WhatsAppFloat from './components/WhatsAppFloat'
import Breadcrumbs from './components/Breadcrumbs'
import ProductComparison from './components/ProductComparison'
import PrivacyConsent from './components/PrivacyConsent'
import PriceDropAlerts from './components/PriceDropAlerts'
import PageTransition from './components/PageTransition'
import IntroReveal from './components/IntroReveal'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Contact from './pages/Contact'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
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
  const isHomeRoute = location.pathname === '/'

  return (
    <div className="App app-3d">
      {!isAdminRoute ? <IntroReveal enabled={isHomeRoute} /> : null}
      <div className="three-scene" aria-hidden="true">
        <span className="three-orb orb-1" />
        <span className="three-orb orb-2" />
        <span className="three-orb orb-3" />
        <span className="three-grid" />
      </div>

      {!isAdminRoute ? (
        <>
          <Navbar />
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
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
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
      <WhatsAppFloat />
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
