/**
 * Demo-only product data when Supabase is not configured (local dev without env).
 * When DB is available, the app uses `products` table data only — no sample merge.
 */
export function getSampleProducts() {
  return [
    {
      id: '1',
      name: 'Classic Aviator Sunglasses',
      price: 2999,
      originalPrice: 3999,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'EYE10',
      discount: 25,
      frameType: 'Full Rim',
      description:
        'Timeless aviator design with UV protection and premium metal frame. Perfect for everyday wear.',
    },
    {
      id: '2',
      name: 'Round Frame Glasses',
      price: 2499,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'EYE10',
      discount: 17,
      frameType: 'Full Rim',
      description:
        'Vintage-inspired round frames perfect for a classic look. Lightweight and comfortable.',
    },
    {
      id: '3',
      name: 'Cat Eye Sunglasses',
      price: 3499,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'sunglasses',
      brand: 'Ray-Ban',
      frameType: 'Full Rim',
      description: 'Elegant cat-eye design with polarized lenses and stylish frame.',
    },
    {
      id: '4',
      name: 'Square Frame Glasses',
      price: 2199,
      image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
      category: 'glasses',
      brand: 'EYE10',
      frameType: 'Full Rim',
      description: 'Modern square frames with anti-glare coating and lightweight design.',
    },
    {
      id: '5',
      name: 'Wayfarer Sunglasses',
      price: 2799,
      originalPrice: 3499,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Oakley',
      discount: 20,
      frameType: 'Full Rim',
      description: 'Iconic wayfarer style with durable acetate frame and UV400 protection.',
    },
    {
      id: '6',
      name: 'Oval Frame Glasses',
      price: 2299,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'EYE10',
      frameType: 'Full Rim',
      description: 'Comfortable oval frames with blue light filter technology.',
    },
    {
      id: '7',
      name: 'Rimless Glasses',
      price: 1899,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
      category: 'glasses',
      brand: 'Gucci',
      discount: 24,
      frameType: 'Rimless',
      description: 'Ultra-lightweight rimless design for maximum comfort and style.',
    },
    {
      id: '8',
      name: 'Sport Sunglasses',
      price: 4499,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Oakley',
      frameType: 'Full Rim',
      description: 'High-performance sports sunglasses with impact-resistant lenses.',
    },
    {
      id: '9',
      name: 'Browline Glasses',
      price: 2699,
      originalPrice: 3299,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
      category: 'glasses',
      brand: 'Prada',
      discount: 18,
      frameType: 'Browline',
      description: 'Sophisticated browline frames combining metal and acetate materials.',
    },
    {
      id: '10',
      name: 'Oversized Sunglasses',
      price: 3799,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      category: 'sunglasses',
      brand: 'Versace',
      frameType: 'Full Rim',
      description: 'Luxury oversized sunglasses with gradient lenses and designer frame.',
    },
  ]
}

export function getSampleProductById(id) {
  return getSampleProducts().find((p) => String(p.id) === String(id)) || null
}
