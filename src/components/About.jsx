import { Award, Users, Clock, TrendingUp } from 'lucide-react'
import { useSiteContent } from '../context/SiteContentContext'
import './About.css'

function About() {
  const { content } = useSiteContent()

  const stats = [
    { icon: Clock, value: '10+', label: 'Years Experience' },
    { icon: Users, value: '50K+', label: 'Happy Customers' },
    { icon: Award, value: '100%', label: 'Authentic Products' },
    { icon: TrendingUp, value: '500+', label: 'Products Available' },
  ]

  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <div className="experience-badge">
              <Clock size={24} />
              <span>We Have Experience Of 15+ Years</span>
            </div>
            <h2>About {content?.brand?.name || 'EYE10'}</h2>
            <p className="about-lead">{content?.about?.lead}</p>
            <p className="about-description">{content?.about?.descriptionOne}</p>
            <p className="about-description">
              We offer authentic products from leading brands, expert consultation,
              and comprehensive after-sales service. Our team is dedicated to helping
              you find the perfect pair that matches your style and meets your vision needs.
            </p>
            <div className="about-features">
              <div className="feature-item">
                <span className="feature-check">+</span>
                <span>100% Authentic Products</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">+</span>
                <span>Expert Consultation</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">+</span>
                <span>Comprehensive Warranty</span>
              </div>
              <div className="feature-item">
                <span className="feature-check">+</span>
                <span>Professional Service</span>
              </div>
            </div>
          </div>
          <div className="about-stats">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div
                  key={index}
                  className="stat-card"
                  style={{ '--delay': `${index * 0.1}s` }}
                >
                  <div className="stat-icon-wrapper">
                    <IconComponent size={32} className="stat-icon" />
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
