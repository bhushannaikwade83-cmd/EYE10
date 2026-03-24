import { Eye, Wrench, Sparkles, Shield, Award, Stethoscope, Frame, Zap } from 'lucide-react'
import './Services.css'

function Services() {
  const services = [
    {
      id: 1,
      icon: Eye,
      title: 'Eye Examination',
      description: 'Comprehensive eye tests and vision assessment by certified optometrists. Get accurate prescriptions for your perfect vision.',
      color: '#b58a2a',
    },
    {
      id: 2,
      icon: Frame,
      title: 'Frame Repair & Adjustment',
      description: 'Expert frame repair and professional adjustment services. We fix bent frames, loose screws, and ensure perfect fit.',
      color: '#ec4899',
    },
    {
      id: 3,
      icon: Sparkles,
      title: 'Lens Replacement',
      description: 'High-quality lens replacement with options: prescription lenses, anti-glare coating, blue light filter, and progressive lenses.',
      color: '#f59e0b',
    },
    {
      id: 4,
      icon: Wrench,
      title: 'Frame Fitting',
      description: 'Professional frame fitting and adjustment to ensure perfect comfort, optimal vision, and proper alignment for your face shape.',
      color: '#10b981',
    },
    {
      id: 5,
      icon: Shield,
      title: 'Warranty & Service',
      description: 'Comprehensive warranty coverage on all eyewear. Easy claim process, free adjustments, and lifetime support.',
      color: '#c56a3a',
    },
    {
      id: 6,
      icon: Award,
      title: 'Expert Consultation',
      description: 'Free consultation with our expert opticians to help you choose the perfect frames, lenses, and style for your needs.',
      color: '#14b8a6',
    },
  ]

  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="section-header">
          <h2>Authorized Service Centre</h2>
          <p className="section-subtitle">Expert eyewear services for all leading brands</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <div
                key={service.id}
                className="service-card"
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <div className="service-icon-wrapper" style={{ '--service-color': service.color }}>
                  <IconComponent size={40} className="service-icon" />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Services
