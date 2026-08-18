export const defaultSiteContent = {
  brand: {
    name: 'EYE10',
    tagline: 'Premium Eyewear & Opticals',
  },
  navbar: {
    phone: '+91 99999 99999',
  },
  /** Canonical store for phone, WhatsApp, email, address — mirrored to navbar/footer on save in Admin. */
  contact: {
    phone: '+91 99999 99999',
    whatsappNumber: '9773609077',
    email: 'info@eye10.com',
    address: '123 Main Street, City, State - 123456, India',
    /** Store location in Google Maps (footer + contact “Visit us”). Short link OK. */
    googleMapsUrl: 'https://maps.app.goo.gl/rdbWifiseAVVfFm89',
  },
  hero: {
    badge: 'Exclusive Eyewear Showroom',
    titlePrefix: 'See the World Clearly',
    titleHighlight: 'with EYE10',
    subtitle:
      'Every pair of glasses represents who you are. Discover premium eyewear that combines style, comfort, and quality. Find your perfect pair at EYE10.',
  },
  about: {
    lead: 'Every pair of glasses represents who you are and how you see the world.',
    descriptionOne:
      "EYE10 is your trusted destination for premium eyewear. We combine style, comfort, and quality to help you see the world clearly. With years of experience serving customers, we understand that eyewear isn't just an accessory-it's a statement of your personality.",
  },
  cta: {
    heading: 'Ready to Find Your Perfect Pair?',
    subheading: 'Contact us for expert consultation on premium eyewear',
  },
  footer: {
    description:
      'Your trusted destination for premium eyewear. We combine style, comfort, and quality to help you see the world clearly.',
    phone: '+91 99999 99999',
    email: 'info@eye10.com',
    address: '123 Main Street, City, State - 123456, India',
    googleMapsUrl: 'https://maps.app.goo.gl/rdbWifiseAVVfFm89',
  },
  /** Footer social icons — full URLs (https://…). Empty string hides the icon. */
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
  },
  /** Legacy single PDF; kept in sync with first `catalogueItems` entry when saving from Admin. */
  catalogue: {
    brandName: '',
    title: 'EYE10 product catalogue',
    pdfUrl: '',
    storagePath: '',
    fileName: '',
    updatedAt: '',
  },
  /** Per-brand PDF catalogues: { id, brandName, title?, pdfUrl, storagePath?, fileName?, updatedAt? } */
  catalogueItems: [],
  /** Up to 8 product IDs from `products` (shown on Home featured section). */
  featuredProductIds: [],
  /** Products listing page title / subtitle (Admin → Website content). */
  productsPage: {
    title: 'Our Products',
    subtitle: 'Discover our premium eyewear collection',
  },
  /** Home featured strip (Admin → Website content). */
  homeProducts: {
    featuredHeading: 'Featured Products',
    viewAllLabel: 'View All',
  },
  /**
   * Brands strip: heading/subtitle editable in Admin. `items` is fallback when products have no brand names yet.
   * Each item: { name: string, logo: string } (logo = short initials shown in the circle).
   */
  brandsSection: {
    heading: 'Brands We Offer',
    subtitle: "Premium eyewear from world's leading brands",
    items: [],
  },
}

function mergeCatalogueItems(remote) {
  const raw = remote.catalogueItems
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter(Boolean).slice(0, 40)
  }
  return []
}

export const mergeSiteContent = (remote = {}) => ({
  ...defaultSiteContent,
  ...remote,
  brand: { ...defaultSiteContent.brand, ...(remote.brand || {}) },
  navbar: { ...defaultSiteContent.navbar, ...(remote.navbar || {}) },
  contact: {
    ...defaultSiteContent.contact,
    ...(remote.contact || {}),
    phone:
      (remote.contact && remote.contact.phone) ||
      (remote.navbar && remote.navbar.phone) ||
      (remote.footer && remote.footer.phone) ||
      defaultSiteContent.contact.phone,
    email:
      (remote.contact && remote.contact.email) ||
      (remote.footer && remote.footer.email) ||
      defaultSiteContent.contact.email,
    address:
      (remote.contact && remote.contact.address) ||
      (remote.footer && remote.footer.address) ||
      defaultSiteContent.contact.address,
    whatsappNumber:
      (remote.contact && remote.contact.whatsappNumber) || defaultSiteContent.contact.whatsappNumber,
  },
  hero: { ...defaultSiteContent.hero, ...(remote.hero || {}) },
  about: { ...defaultSiteContent.about, ...(remote.about || {}) },
  cta: { ...defaultSiteContent.cta, ...(remote.cta || {}) },
  footer: { ...defaultSiteContent.footer, ...(remote.footer || {}) },
  socialLinks: {
    ...defaultSiteContent.socialLinks,
    ...(remote.socialLinks || {}),
  },
  catalogueItems: mergeCatalogueItems(remote),
  catalogue: {
    ...defaultSiteContent.catalogue,
    ...(remote.catalogue || {}),
  },
  featuredProductIds: Array.isArray(remote.featuredProductIds)
    ? remote.featuredProductIds.filter(Boolean).slice(0, 8)
    : defaultSiteContent.featuredProductIds,
  productsPage: {
    ...defaultSiteContent.productsPage,
    ...(remote.productsPage || {}),
  },
  homeProducts: {
    ...defaultSiteContent.homeProducts,
    ...(remote.homeProducts || {}),
  },
  brandsSection: {
    ...defaultSiteContent.brandsSection,
    ...(remote.brandsSection || {}),
    items: Array.isArray(remote?.brandsSection?.items)
      ? remote.brandsSection.items
      : defaultSiteContent.brandsSection.items,
  },
})
