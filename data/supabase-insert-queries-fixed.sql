-- =====================================================
-- INSERT EYEWEAR PRODUCTS (FIXED - with UUIDs)
-- =====================================================

INSERT INTO products (id, data) VALUES
(gen_random_uuid(), jsonb_build_object(
  'name', 'Ray-Ban Aviator Classic',
  'price', 4999,
  'originalPrice', 5999,
  'category', 'sunglasses',
  'brand', 'Ray-Ban',
  'frameType', 'Full Rim',
  'color', 'Gold',
  'image', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
  'description', 'Iconic Ray-Ban Aviator with classic gold frame and green lenses. UV protection and timeless style for any occasion.',
  'stock', 15,
  'discount', 17
)),
(gen_random_uuid(), jsonb_build_object(
  'name', 'Oakley Flak 2.0 XL',
  'price', 6499,
  'originalPrice', 7999,
  'category', 'sunglasses',
  'brand', 'Oakley',
  'frameType', 'Full Rim',
  'color', 'Matte Black',
  'image', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
  'description', 'High-performance sports sunglasses with interchangeable lenses. Perfect for athletes and outdoor enthusiasts.',
  'stock', 12,
  'discount', 19
)),
(gen_random_uuid(), jsonb_build_object(
  'name', 'Tom Ford Gabriela',
  'price', 8999,
  'originalPrice', 11999,
  'category', 'sunglasses',
  'brand', 'Tom Ford',
  'frameType', 'Full Rim',
  'color', 'Tortoiseshell',
  'image', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
  'description', 'Luxury oversized sunglasses with brown tortoiseshell frame. Premium Italian craftsmanship and contemporary style.',
  'stock', 8,
  'discount', 25
)),
(gen_random_uuid(), jsonb_build_object(
  'name', 'Warby Parker Percey',
  'price', 2999,
  'originalPrice', 3499,
  'category', 'glasses',
  'brand', 'Warby Parker',
  'frameType', 'Full Rim',
  'color', 'Cognac Tortoise',
  'image', 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=500',
  'description', 'Timeless and sophisticated frame in cognac tortoiseshell. Blue light filtering lenses available for digital work.',
  'stock', 20,
  'discount', 14
)),
(gen_random_uuid(), jsonb_build_object(
  'name', 'Gucci GG0416S',
  'price', 7499,
  'originalPrice', 9999,
  'category', 'sunglasses',
  'brand', 'Gucci',
  'frameType', 'Full Rim',
  'color', 'Black/Gold',
  'image', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
  'description', 'Luxury rectangular frame with signature Gucci detailing. Premium acetate construction with UV400 lenses.',
  'stock', 10,
  'discount', 25
));

-- =====================================================
-- UPDATE SITE CONTENT WITH CATALOGUES
-- =====================================================

UPDATE site_content
SET catalogueItems = COALESCE(catalogueItems, '[]'::jsonb) || jsonb_build_array(
  jsonb_build_object(
    'id', 'cat_rayban_2024',
    'brandName', 'Ray-Ban',
    'title', 'Ray-Ban 2024 Collection Catalogue',
    'pdfUrl', 'https://qjjkfrncnarqifzkjnyc.supabase.co/storage/v1/object/public/media/catalogue/brands/ray_ban/catalogue.pdf',
    'storagePath', 'catalogue/brands/ray_ban/catalogue.pdf',
    'fileName', 'ray-ban-2024-catalogue.pdf',
    'updatedAt', NOW()::text
  ),
  jsonb_build_object(
    'id', 'cat_oakley_2024',
    'brandName', 'Oakley',
    'title', 'Oakley Performance Eyewear 2024',
    'pdfUrl', 'https://qjjkfrncnarqifzkjnyc.supabase.co/storage/v1/object/public/media/catalogue/brands/oakley/catalogue.pdf',
    'storagePath', 'catalogue/brands/oakley/catalogue.pdf',
    'fileName', 'oakley-2024-catalogue.pdf',
    'updatedAt', NOW()::text
  ),
  jsonb_build_object(
    'id', 'cat_tomford_luxury',
    'brandName', 'Tom Ford',
    'title', 'Tom Ford Luxury Eyewear Collection',
    'pdfUrl', 'https://qjjkfrncnarqifzkjnyc.supabase.co/storage/v1/object/public/media/catalogue/brands/tom_ford/catalogue.pdf',
    'storagePath', 'catalogue/brands/tom_ford/catalogue.pdf',
    'fileName', 'tom-ford-luxury-catalogue.pdf',
    'updatedAt', NOW()::text
  ),
  jsonb_build_object(
    'id', 'cat_gucci_ss2024',
    'brandName', 'Gucci',
    'title', 'Gucci Eyewear Spring/Summer 2024',
    'pdfUrl', 'https://qjjkfrncnarqifzkjnyc.supabase.co/storage/v1/object/public/media/catalogue/brands/gucci/catalogue.pdf',
    'storagePath', 'catalogue/brands/gucci/catalogue.pdf',
    'fileName', 'gucci-ss2024-catalogue.pdf',
    'updatedAt', NOW()::text
  ),
  jsonb_build_object(
    'id', 'cat_warbparker_home',
    'brandName', 'Warby Parker',
    'title', 'Warby Parker Home Collection',
    'pdfUrl', 'https://qjjkfrncnarqifzkjnyc.supabase.co/storage/v1/object/public/media/catalogue/brands/warby_parker/catalogue.pdf',
    'storagePath', 'catalogue/brands/warby_parker/catalogue.pdf',
    'fileName', 'warby-parker-home-collection.pdf',
    'updatedAt', NOW()::text
  )
)
WHERE id = 'default';
