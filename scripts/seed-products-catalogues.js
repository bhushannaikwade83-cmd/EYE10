#!/usr/bin/env node
/**
 * Seed real eyewear products and catalogues into Supabase
 * Run: node scripts/seed-products-catalogues.js
 */

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env
dotenv.config({ path: `${__dirname}/../.env` })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Real eyewear products
const PRODUCTS = [
  {
    name: 'Ray-Ban Aviator Classic',
    price: 4999,
    originalPrice: 5999,
    category: 'sunglasses',
    brand: 'Ray-Ban',
    frameType: 'Full Rim',
    color: 'Gold',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    description:
      'Iconic Ray-Ban Aviator with classic gold frame and green lenses. UV protection and timeless style for any occasion.',
    stock: 15,
    discount: 17,
  },
  {
    name: 'Oakley Flak 2.0 XL',
    price: 6499,
    originalPrice: 7999,
    category: 'sunglasses',
    brand: 'Oakley',
    frameType: 'Full Rim',
    color: 'Matte Black',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
    description:
      'High-performance sports sunglasses with interchangeable lenses. Perfect for athletes and outdoor enthusiasts.',
    stock: 12,
    discount: 19,
  },
  {
    name: 'Tom Ford Gabriela',
    price: 8999,
    originalPrice: 11999,
    category: 'sunglasses',
    brand: 'Tom Ford',
    frameType: 'Full Rim',
    color: 'Tortoiseshell',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    description:
      'Luxury oversized sunglasses with brown tortoiseshell frame. Premium Italian craftsmanship and contemporary style.',
    stock: 8,
    discount: 25,
  },
  {
    name: 'Warby Parker Home Try-On - Percey',
    price: 2999,
    originalPrice: 3499,
    category: 'glasses',
    brand: 'Warby Parker',
    frameType: 'Full Rim',
    color: 'Cognac Tortoise',
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
    description:
      'Timeless and sophisticated frame in cognac tortoiseshell. Blue light filtering lenses available for digital work.',
    stock: 20,
    discount: 14,
  },
  {
    name: 'Gucci GG0416S',
    price: 7499,
    originalPrice: 9999,
    category: 'sunglasses',
    brand: 'Gucci',
    frameType: 'Full Rim',
    color: 'Black/Gold',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
    description:
      'Luxury rectangular frame with signature Gucci detailing. Premium acetate construction with UV400 lenses.',
    stock: 10,
    discount: 25,
  },
  {
    name: 'JINS Screen Glasses Blue Light Filter',
    price: 1999,
    category: 'glasses',
    brand: 'JINS',
    frameType: 'Full Rim',
    color: 'Black',
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
    description:
      'Modern blue light blocking glasses for screen time. Lightweight design with anti-reflective coating.',
    stock: 25,
    discount: 10,
  },
]

// Catalogues structure
const CATALOGUES = [
  {
    brandName: 'Ray-Ban',
    title: 'Ray-Ban 2024 Collection Catalogue',
    fileName: 'ray-ban-2024-catalogue.pdf',
  },
  {
    brandName: 'Oakley',
    title: 'Oakley Performance Eyewear 2024',
    fileName: 'oakley-2024-catalogue.pdf',
  },
  {
    brandName: 'Tom Ford',
    title: 'Tom Ford Luxury Eyewear Collection',
    fileName: 'tom-ford-luxury-catalogue.pdf',
  },
  {
    brandName: 'Gucci',
    title: 'Gucci Eyewear Spring/Summer 2024',
    fileName: 'gucci-ss2024-catalogue.pdf',
  },
  {
    brandName: 'Warby Parker',
    title: 'Warby Parker Home Collection',
    fileName: 'warby-parker-home-collection.pdf',
  },
]

async function seedProducts() {
  console.log('🚀 Starting product and catalogue seed...\n')

  try {
    // Insert products
    console.log('📦 Adding eyewear products to Supabase...')
    for (const product of PRODUCTS) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          data: product,
        })
        .select()

      if (error) {
        console.error(`❌ Failed to add ${product.name}:`, error.message)
      } else {
        console.log(`✅ Added: ${product.name} (ID: ${data[0]?.id})`)
      }
    }

    // Insert catalogues
    console.log('\n📚 Adding catalogues to site content...')

    // First, get current site content
    const { data: contentData, error: contentError } = await supabase
      .from('site_content')
      .select('*')
      .single()

    if (contentError && contentError.code !== 'PGRST116') {
      console.error('❌ Failed to fetch site_content:', contentError.message)
      return
    }

    const currentCatalogues = contentData?.catalogueItems || []
    const newCatalogues = CATALOGUES.map((cat) => ({
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      brandName: cat.brandName,
      title: cat.title,
      pdfUrl: `https://${process.env.VITE_B2_API_BASE_URL || 'f002.backblazeb2.com'}/b2api/v1/b2_download_file_by_id?fileId=${cat.fileName}`,
      storagePath: `catalogue/brands/${cat.brandName.toLowerCase().replace(/\s+/g, '_')}/catalogue.pdf`,
      fileName: cat.fileName,
      updatedAt: new Date().toISOString(),
    }))

    const updatedContent = {
      ...contentData,
      catalogueItems: [...currentCatalogues, ...newCatalogues],
    }

    const { error: updateError } = await supabase
      .from('site_content')
      .upsert({ id: contentData?.id || 'default', ...updatedContent })

    if (updateError) {
      console.error('❌ Failed to update catalogues:', updateError.message)
    } else {
      console.log(`✅ Added ${newCatalogues.length} catalogues to site content`)
      newCatalogues.forEach((cat) => {
        console.log(`   - ${cat.brandName}: ${cat.title}`)
      })
    }

    console.log('\n✨ Seed complete!')
    console.log(`   - ${PRODUCTS.length} products added`)
    console.log(`   - ${newCatalogues.length} catalogues added`)
    console.log('\n📱 Products and catalogues will now appear on your website!')
  } catch (error) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  }
}

seedProducts()
