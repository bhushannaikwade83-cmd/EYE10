import { Gift, Building2, Users } from 'lucide-react'
import './AdditionalServices.css'

function AdditionalServices() {
  const services = [
    {
      icon: Gift,
      title: 'Corporate Gifting',
      description: 'Perfect eyewear solutions for corporate gifts and employee benefits',
      color: '#6366f1',
    },
    {
      icon: Building2,
      title: 'Bulk Orders',
      description: 'Special pricing for bulk orders and corporate partnerships',
      color: '#f59e0b',
    },
    {
      icon: Users,
      title: 'Group Discounts',
      description: 'Attractive discounts for group purchases and family packages',
      color: '#ec4899',
    },
  ]

  return (
    <section className="additional-services">
      <div className="container">
        <div className="section-header">
          <h2>We Also Offer</h2>
          <p className="section-subtitle">Additional services and special offers</p>
        </div>

        <div className="additional-services-grid">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <div
                key={index}
                className="additional-service-card"
                style={{ '--delay': `${index * 0.1}s`, '--service-color': service.color }}
              >
                <div className="service-icon-wrapper">
                  <IconComponent size={48} className="service-icon" />
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

export default AdditionalServices
