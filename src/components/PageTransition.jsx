import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './PageTransition.css'

function PageTransition({ children }) {
  const location = useLocation()

  useEffect(() => {
    // Add transition class on route change
    const main = document.querySelector('main')
    if (main) {
      main.classList.add('page-transition-enter')
      setTimeout(() => {
        main.classList.remove('page-transition-enter')
      }, 400)
    }
  }, [location.pathname])

  return <>{children}</>
}

export default PageTransition
