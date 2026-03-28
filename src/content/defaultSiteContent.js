export const defaultSiteContent = {
  brand: {
    name: 'EYE10',
    tagline: 'Premium Eyewear',
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
  /** Footer social icons — full URLs (https://…). Empty string hides the icon. */
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
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
  /** Up to 8 product document IDs from Firestore `products` (shown on Home featured section). */
  featuredProductIds: [],
  /**
   * Up to 5 offer slides on Home (images or video). Set via Admin → Home banners.
   * { id, mediaUrl, mediaType: 'image'|'video', storagePath?, title?, linkUrl? }
   */
  homeBanners: [],
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
   * Brands strip: heading/subtitle editable in Admin. `items` is fallback when Firestore has no product brands.
   * Each item: { name: string, logo: string } (logo = short initials shown in the circle).
   */
  brandsSection: {
    heading: 'Brands We Offer',
    subtitle: "Premium eyewear from world's leading brands",
    items: [
      { name: 'Ray-Ban', logo: 'RB' },
      { name: 'Oakley', logo: 'OK' },
      { name: 'Gucci', logo: 'GC' },
      { name: 'Prada', logo: 'PR' },
      { name: 'Versace', logo: 'VS' },
      { name: 'Tom Ford', logo: 'TF' },
      { name: 'Dior', logo: 'DR' },
      { name: 'Chanel', logo: 'CH' },
      { name: 'Armani', logo: 'AR' },
      { name: 'Burberry', logo: 'BR' },
      { name: 'Polo', logo: 'PL' },
      { name: 'Hugo Boss', logo: 'HB' },
    ],
  },
}

function mergeCatalogueItems(remote) {
  const raw = remote.catalogueItems
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter(Boolean).slice(0, 40)
  }
  const c = remote.catalogue
  if (c && String(c.pdfUrl || '').trim()) {
    return [
      {
        id: 'legacy',
        brandName: String(c.brandName || 'Catalogue').trim() || 'Catalogue',
        title: String(c.title || c.brandName || 'Download catalogue').trim() || 'Download catalogue',
        pdfUrl: String(c.pdfUrl).trim(),
        storagePath: String(c.storagePath || '').trim(),
        fileName: String(c.fileName || '').trim(),
        updatedAt: c.updatedAt || '',
      },
    ]
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
  eventBanner: {
    ...defaultSiteContent.eventBanner,
    ...(remote.eventBanner || {}),
  },
  catalogueItems: mergeCatalogueItems(remote),
  catalogue: {
    ...defaultSiteContent.catalogue,
    ...(remote.catalogue || {}),
  },
  featuredProductIds: Array.isArray(remote.featuredProductIds)
    ? remote.featuredProductIds.filter(Boolean).slice(0, 8)
    : defaultSiteContent.featuredProductIds,
  homeBanners: Array.isArray(remote.homeBanners)
    ? remote.homeBanners.filter(Boolean).slice(0, 5)
    : defaultSiteContent.homeBanners,
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
