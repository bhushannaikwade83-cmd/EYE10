import { useState, useEffect, useRef } from 'react'
import { Users, ShoppingBag, Star, Award } from 'lucide-react'
import './StatsCounter.css'

function StatsCounter() {
  const [isVisible, setIsVisible] = useState(false)
  const statsRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [])

  const stats = [
    { icon: Users, value: 10000, suffix: '+', label: 'Happy Customers' },
    { icon: ShoppingBag, value: 5000, suffix: '+', label: 'Products Sold' },
    { icon: Star, value: 4.8, suffix: '/5', label: 'Average Rating' },
    { icon: Award, value: 15, suffix: '+', label: 'Years Experience' },
  ]

  return (
    <section className="stats-counter" ref={statsRef}>
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              isVisible={isVisible}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ icon: Icon, value, suffix, label, isVisible, delay }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <div className="stat-item" style={{ animationDelay: `${delay}s` }}>
      <div className="stat-icon-wrapper">
        <Icon size={40} className="stat-icon" />
      </div>
      <div className="stat-value">
        {typeof value === 'number' && value % 1 !== 0
          ? count.toFixed(1)
          : count}
        {suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default StatsCounter
