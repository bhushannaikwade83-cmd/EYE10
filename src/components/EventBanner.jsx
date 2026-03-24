import { Link } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'
import './EventBanner.css'

const isDateInRange = (startDate, endDate) => {
  if (!startDate && !endDate) return true

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const toLocalDate = (dateString) => {
    if (!dateString) return null
    const parsed = new Date(`${dateString}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) return null
    parsed.setHours(0, 0, 0, 0)
    return parsed
  }

  let start = null
  let end = null

  if (startDate) {
    start = toLocalDate(startDate)
    if (!start) return false
  }

  if (endDate) {
    end = toLocalDate(endDate)
    if (!end) return false
  }

  if (start && today < start) return false
  if (end && today > end) return false
  return true
}

function EventBanner() {
  const { content } = useSiteContent()
  const banner = content?.eventBanner || {}

  if (!banner.enabled) return null
  if (!isDateInRange(banner.startDate, banner.endDate)) return null

  const hasButton = banner.buttonText && banner.buttonUrl

  const button = banner.buttonUrl?.startsWith('http') ? (
    <a
      href={banner.buttonUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="event-banner-btn"
    >
      {banner.buttonText}
    </a>
  ) : (
    <Link to={banner.buttonUrl || '/products'} className="event-banner-btn">
      {banner.buttonText}
    </Link>
  )

  return (
    <section className="event-banner" aria-label="Event banner">
      <div className="container event-banner-inner">
        <div className="event-banner-copy">
          <h3>{banner.title}</h3>
          {banner.subtitle ? <p>{banner.subtitle}</p> : null}
        </div>
        {hasButton ? button : null}
      </div>
    </section>
  )
}

export default EventBanner
