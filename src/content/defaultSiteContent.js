export const defaultSiteContent = {
  brand: {
    name: 'EYE10',
    tagline: 'Premium Eyewear',
  },
  navbar: {
    phone: '+91 99999 99999',
  },
  contact: {
    whatsappNumber: '9773609077',
    email: 'info@eye10.com',
    address: '123 Main Street, City, State - 123456, India',
  },
  hero: {
    badge: 'Exclusive Eyewear Showroom',
    titlePrefix: 'See the World',
    titleHighlight: 'with Clearity',
    subtitle:
      'Every pair of glasses represents who you are. Discover premium eyewear that combines style, comfort, and quality. Find your perfect pair at EYE10.',
  },
  about: {
    lead: 'Every pair of glasses represents who you are and how you see the world.',
    descriptionOne:
      "EYE10 is your trusted destination for premium eyewear. We combine style, comfort, and quality to help you see the world clearly. With years of experience serving customers, we understand that eyewear is not just a necessity-it's a statement of your personality.",
  },
  cta: {
    heading: 'Ready to Find Your Perfect Pair?',
    subheading: 'Contact us for expert consultation and premium eyewear',
  },
  footer: {
    description:
      'Your trusted destination for premium eyewear. We combine style, comfort, and quality to help you see the world clearly.',
    phone: '+91 99999 99999',
    email: 'info@eye10.com',
    address: '123 Main Street, City, State - 123456, India',
  },
  eventBanner: {
    enabled: true,
    title: 'Demo Event Banner: Republic Day Offer',
    subtitle: 'Flat 20% off on selected premium frames for a limited time.',
    buttonText: 'View Offers',
    buttonUrl: '/products',
    startDate: '',
    endDate: '',
  },
}

export const mergeSiteContent = (remote = {}) => ({
  ...defaultSiteContent,
  ...remote,
  brand: { ...defaultSiteContent.brand, ...(remote.brand || {}) },
  navbar: { ...defaultSiteContent.navbar, ...(remote.navbar || {}) },
  contact: { ...defaultSiteContent.contact, ...(remote.contact || {}) },
  hero: { ...defaultSiteContent.hero, ...(remote.hero || {}) },
  about: { ...defaultSiteContent.about, ...(remote.about || {}) },
  cta: { ...defaultSiteContent.cta, ...(remote.cta || {}) },
  footer: { ...defaultSiteContent.footer, ...(remote.footer || {}) },
  eventBanner: {
    ...defaultSiteContent.eventBanner,
    ...(remote.eventBanner || {}),
  },
})
