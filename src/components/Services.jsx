import { Eye, Sparkles, Frame, Battery, Watch, Gem } from 'lucide-react'
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
      icon: Battery,
      title: 'Watch Battery Replacement',
      description: 'Genuine batteries fitted in minutes for all leading watch brands, with a quick clean and check included.',
      color: '#10b981',
    },
    {
      id: 5,
      icon: Watch,
      title: 'Strap & Glass Replacement',
      description: 'Genuine leather, metal, and PVC straps, plus watch glass replacement for scratched or cracked crystals.',
      color: '#c56a3a',
    },
    {
      id: 6,
      icon: Gem,
      title: 'Mechanical Watch Repair',
      description: 'Trained, specialized technicians for automatic and mechanical watch servicing and repair.',
      color: '#14b8a6',
    },
  ]

  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="section-header">
          <h2>Authorized Service Centre</h2>
          <p className="section-subtitle">Expert eyewear and watch services for all leading brands</p>
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
