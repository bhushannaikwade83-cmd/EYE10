/**
 * Paste this entire script into browser console at http://localhost:3000/admin (after logging in)
 * It will add all eyewear products and catalogues to your Supabase database
 */

const PRODUCTS_DATA = [
  {
    name: "Ray-Ban Aviator Classic",
    price: 4999,
    originalPrice: 5999,
    category: "sunglasses",
    brand: "Ray-Ban",
    frameType: "Full Rim",
    color: "Gold",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    description: "Iconic Ray-Ban Aviator with classic gold frame and green lenses. UV protection and timeless style for any occasion.",
    stock: 15,
    discount: 17,
  },
  {
    name: "Oakley Flak 2.0 XL",
    price: 6499,
    originalPrice: 7999,
    category: "sunglasses",
    brand: "Oakley",
    frameType: "Full Rim",
    color: "Matte Black",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
    description: "High-performance sports sunglasses with interchangeable lenses. Perfect for athletes and outdoor enthusiasts.",
    stock: 12,
    discount: 19,
  },
  {
    name: "Tom Ford Gabriela",
    price: 8999,
    originalPrice: 11999,
    category: "sunglasses",
    brand: "Tom Ford",
    frameType: "Full Rim",
    color: "Tortoiseshell",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    description: "Luxury oversized sunglasses with brown tortoiseshell frame. Premium Italian craftsmanship and contemporary style.",
    stock: 8,
    discount: 25,
  },
  {
    name: "Warby Parker Percey",
    price: 2999,
    originalPrice: 3499,
    category: "glasses",
    brand: "Warby Parker",
    frameType: "Full Rim",
    color: "Cognac Tortoise",
    image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500",
    description: "Timeless and sophisticated frame in cognac tortoiseshell. Blue light filtering lenses available for digital work.",
    stock: 20,
    discount: 14,
  },
  {
    name: "Gucci GG0416S",
    price: 7499,
    originalPrice: 9999,
    category: "sunglasses",
    brand: "Gucci",
    frameType: "Full Rim",
    color: "Black/Gold",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
    description: "Luxury rectangular frame with signature Gucci detailing. Premium acetate construction with UV400 lenses.",
    stock: 10,
    discount: 25,
  },
];

async function importProducts() {
  console.log("🚀 Starting product import...");

  for (const product of PRODUCTS_DATA) {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: product }),
      });

      if (response.ok) {
        console.log(`✅ Added: ${product.name}`);
      } else {
        const error = await response.json();
        console.error(`❌ Failed to add ${product.name}:`, error);
      }
    } catch (error) {
      console.error(`❌ Error adding ${product.name}:`, error.message);
    }
  }

  console.log("\n✨ Import complete!");
}

// Run the import
importProducts();
