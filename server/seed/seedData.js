const users = [
  {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'Admin@123456',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    addresses: [
      {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'USA',
        isDefault: true
      }
    ]
  },
  {
    name: 'Alex Johnson',
    email: 'user@ecommerce.com',
    password: 'User@123456',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    addresses: [
      {
        street: '123 Market Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
        isDefault: true
      }
    ]
  }
];

const categories = [
  {
    name: 'Electronics & Audio',
    slug: 'electronics-audio',
    description: 'High-fidelity audio, smart devices, and next-gen personal electronics.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
  },
  {
    name: 'Modern Fashion',
    slug: 'modern-fashion',
    description: 'Timeless luxury apparel, designer accessories, and minimalist everyday wear.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80'
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Architectural home decor, ergonomic furniture, and artisanal essentials.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80'
  },
  {
    name: 'Fitness & Gear',
    slug: 'fitness-gear',
    description: 'Premium activewear, recovery accessories, and high-performance equipment.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80'
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Curated design volumes, leatherbound journals, and fine writing instruments.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'
  }
];

const products = [
  // Category: Electronics & Audio
  {
    name: 'Aura Studio Wireless Noise-Cancelling Headphones',
    slug: 'aura-studio-wireless-headphones',
    description: 'Engineered with titanium 40mm drivers and active hybrid noise cancellation for pristine acoustic transparency and 40-hour battery life.',
    price: 349.99,
    discountPrice: 299.99,
    categorySlug: 'electronics-audio',
    stock: 25,
    brand: 'Aura Sound',
    isFeatured: true,
    tags: ['audio', 'wireless', 'headphones', 'noise-cancelling'],
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', public_id: 'prod_1' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80', public_id: 'prod_1_2' }
    ]
  },
  {
    name: 'Lumio Ceramic Mechanical Keyboard',
    slug: 'lumio-ceramic-mechanical-keyboard',
    description: 'Precision CNC-milled aluminum chassis with hot-swappable lubricated switches, South-facing RGB lighting, and custom PBT keycaps.',
    price: 189.00,
    discountPrice: 159.00,
    categorySlug: 'electronics-audio',
    stock: 18,
    brand: 'Lumio Tech',
    isFeatured: true,
    tags: ['keyboard', 'mechanical', 'desktop', 'gaming'],
    images: [
      { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', public_id: 'prod_2' }
    ]
  },
  {
    name: 'Vortex Hi-Fi Smart Speaker',
    slug: 'vortex-hi-fi-smart-speaker',
    description: '360-degree omnidirectional room-filling sound with dual passive bass radiators and AirPlay 2 / Spotify Connect integration.',
    price: 219.50,
    discountPrice: 0,
    categorySlug: 'electronics-audio',
    stock: 12,
    brand: 'Vortex',
    isFeatured: false,
    tags: ['speaker', 'smart-home', 'audio'],
    images: [
      { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80', public_id: 'prod_3' }
    ]
  },
  {
    name: 'Chronos Smart Watch Ultra',
    slug: 'chronos-smart-watch-ultra',
    description: 'Sapphire crystal display, ECG heart rate tracking, oxygen saturation sensors, and military-grade titanium waterproof housing.',
    price: 429.00,
    discountPrice: 389.00,
    categorySlug: 'electronics-audio',
    stock: 30,
    brand: 'Chronos',
    isFeatured: true,
    tags: ['smartwatch', 'wearables', 'fitness'],
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', public_id: 'prod_4' }
    ]
  },

  // Category: Modern Fashion
  {
    name: 'Minimalist Italian Wool Overcoat',
    slug: 'minimalist-italian-wool-overcoat',
    description: 'Crafted from virgin Tuscan wool with tailored horn buttons, a relaxed drop-shoulder silhouette, and satin lining.',
    price: 480.00,
    discountPrice: 395.00,
    categorySlug: 'modern-fashion',
    stock: 10,
    brand: 'Atelier Noir',
    isFeatured: true,
    tags: ['jacket', 'overcoat', 'winter', 'wool'],
    images: [
      { url: 'https://images.unsplash.com/photo-1539533018447-63fcce667823?w=800&q=80', public_id: 'prod_5' }
    ]
  },
  {
    name: 'Heritage Full-Grain Leather Weekender',
    slug: 'heritage-leather-weekender',
    description: 'Handcrafted vegetable-tanned leather duffle with solid brass hardware, separate shoe compartment, and reinforced straps.',
    price: 320.00,
    discountPrice: 280.00,
    categorySlug: 'modern-fashion',
    stock: 14,
    brand: 'Vanguard Goods',
    isFeatured: true,
    tags: ['leather', 'bag', 'travel', 'duffle'],
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', public_id: 'prod_6' }
    ]
  },
  {
    name: 'Cashmere Ribbed Crewneck Sweater',
    slug: 'cashmere-ribbed-crewneck-sweater',
    description: '100% Grade-A Mongolian cashmere with ribbed cuffs and hem. Featherlight softness with extraordinary thermal insulation.',
    price: 210.00,
    discountPrice: 175.00,
    categorySlug: 'modern-fashion',
    stock: 22,
    brand: 'Atelier Noir',
    isFeatured: false,
    tags: ['cashmere', 'knitwear', 'apparel'],
    images: [
      { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80', public_id: 'prod_7' }
    ]
  },
  {
    name: 'Aviator Titanium Sunglasses',
    slug: 'aviator-titanium-sunglasses',
    description: 'Polarized scratch-resistant gradient lenses with ultralight Japanese beta-titanium frames and 100% UVA/UVB protection.',
    price: 165.00,
    discountPrice: 0,
    categorySlug: 'modern-fashion',
    stock: 45,
    brand: 'Solstice Eyewear',
    isFeatured: false,
    tags: ['sunglasses', 'accessories', 'summer'],
    images: [
      { url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', public_id: 'prod_8' }
    ]
  },

  // Category: Home & Living
  {
    name: 'Scandinavian Sculptural Table Lamp',
    slug: 'scandinavian-sculptural-table-lamp',
    description: 'Warm ambient LED light diffused through mouth-blown opal glass anchored by a honed Carrara marble base.',
    price: 195.00,
    discountPrice: 165.00,
    categorySlug: 'home-living',
    stock: 16,
    brand: 'Nordic Form',
    isFeatured: true,
    tags: ['lighting', 'lamp', 'decor', 'marble'],
    images: [
      { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', public_id: 'prod_9' }
    ]
  },
  {
    name: 'Stoneware Pour-Over Coffee Set',
    slug: 'stoneware-pour-over-coffee-set',
    description: 'Hand-thrown ceramic dripper and serving carafe finished in speckled matte glaze for barista-level morning brew rituals.',
    price: 85.00,
    discountPrice: 0,
    categorySlug: 'home-living',
    stock: 35,
    brand: 'Clay & Kiln',
    isFeatured: false,
    tags: ['coffee', 'ceramic', 'kitchen', 'artisan'],
    images: [
      { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', public_id: 'prod_10' }
    ]
  },
  {
    name: 'Loom-Woven Belgian Linen Throw',
    slug: 'loom-woven-belgian-linen-throw',
    description: 'Pre-washed pure flax linen throw blanket with raw fringe edging. Breathable in summer and cozy in winter.',
    price: 130.00,
    discountPrice: 110.00,
    categorySlug: 'home-living',
    stock: 20,
    brand: 'Nordic Form',
    isFeatured: false,
    tags: ['textiles', 'linen', 'bedding', 'living-room'],
    images: [
      { url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80', public_id: 'prod_11' }
    ]
  },
  {
    name: 'Aroma Diffuser with Terracotta Dome',
    slug: 'aroma-diffuser-terracotta-dome',
    description: 'Ultrasonic cold mist diffusion encased in hand-glazed terracotta ceramic. Features subtle warm LED glow and 8-hour auto-shutoff.',
    price: 98.00,
    discountPrice: 82.00,
    categorySlug: 'home-living',
    stock: 28,
    brand: 'Aura Living',
    isFeatured: false,
    tags: ['diffuser', 'wellness', 'aromatherapy', 'home'],
    images: [
      { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80', public_id: 'prod_12' }
    ]
  },

  // Category: Fitness & Gear
  {
    name: 'Pro Balance Natural Cork Yoga Mat',
    slug: 'pro-balance-natural-cork-yoga-mat',
    description: 'Eco-friendly organic cork top with natural tree rubber base. Antimicrobial, non-slip sweat-grip, and alignment bodylines.',
    price: 88.00,
    discountPrice: 74.00,
    categorySlug: 'fitness-gear',
    stock: 40,
    brand: 'Zenith Motion',
    isFeatured: true,
    tags: ['yoga', 'fitness', 'eco-friendly', 'mat'],
    images: [
      { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80', public_id: 'prod_13' }
    ]
  },
  {
    name: 'Deep-Tissue Massage Recovery Gun',
    slug: 'deep-tissue-massage-recovery-gun',
    description: 'Brushless motor delivering 3200 RPM percussion therapy with 5 interchangeable heads and whisper-quiet acoustic dampening.',
    price: 189.00,
    discountPrice: 149.00,
    categorySlug: 'fitness-gear',
    stock: 15,
    brand: 'Zenith Motion',
    isFeatured: true,
    tags: ['recovery', 'massage', 'fitness', 'therapy'],
    images: [
      { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', public_id: 'prod_14' }
    ]
  },
  {
    name: 'Hydro-Insulated Steel Flask 32oz',
    slug: 'hydro-insulated-steel-flask-32oz',
    description: 'Triple-layer vacuum insulated stainless steel keeping drinks ice cold for 24 hours or piping hot for 12 hours. BPA free.',
    price: 45.00,
    discountPrice: 0,
    categorySlug: 'fitness-gear',
    stock: 60,
    brand: 'Apex Outdoor',
    isFeatured: false,
    tags: ['water-bottle', 'hydration', 'fitness'],
    images: [
      { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', public_id: 'prod_15' }
    ]
  },
  {
    name: 'Adjustable Cast-Iron Kettlebell Set',
    slug: 'adjustable-cast-iron-kettlebell-set',
    description: 'Space-saving quick-lock mechanism that adjusts between 10, 15, 20, 25, 30, and 40 lbs with ergonomic wide handle grip.',
    price: 175.00,
    discountPrice: 155.00,
    categorySlug: 'fitness-gear',
    stock: 8,
    brand: 'Apex Outdoor',
    isFeatured: false,
    tags: ['weights', 'kettlebell', 'strength', 'home-gym'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', public_id: 'prod_16' }
    ]
  },

  // Category: Books & Stationery
  {
    name: 'Architectural Digest: 100 Years of Style',
    slug: 'architectural-digest-100-years',
    description: 'A lavishly illustrated collector monograph showcasing the landmark interiors, visionary residences, and legendary architects.',
    price: 95.00,
    discountPrice: 80.00,
    categorySlug: 'books-stationery',
    stock: 25,
    brand: 'Chronicle Books',
    isFeatured: true,
    tags: ['book', 'architecture', 'design', 'coffee-table'],
    images: [
      { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', public_id: 'prod_17' }
    ]
  },
  {
    name: 'Handbound Leather Journal with Deckle Edge Paper',
    slug: 'handbound-leather-journal',
    description: '240 pages of 150gsm acid-free handmade cotton paper bound in rich distressed saddle leather with wraparound strap.',
    price: 54.00,
    discountPrice: 46.00,
    categorySlug: 'books-stationery',
    stock: 32,
    brand: 'Scribe Co.',
    isFeatured: false,
    tags: ['journal', 'stationery', 'leather', 'writing'],
    images: [
      { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80', public_id: 'prod_18' }
    ]
  },
  {
    name: 'Precision Solid Brass Fountain Pen',
    slug: 'precision-solid-brass-fountain-pen',
    description: 'Machined from solid brass rod stock with German iridium medium nib. Develops a gorgeous individual patina with daily use.',
    price: 85.00,
    discountPrice: 0,
    categorySlug: 'books-stationery',
    stock: 20,
    brand: 'Scribe Co.',
    isFeatured: false,
    tags: ['pen', 'brass', 'stationery', 'luxury'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80', public_id: 'prod_19' }
    ]
  },
  {
    name: 'The Philosophy of Modern Minimalist Living',
    slug: 'philosophy-modern-minimalist-living',
    description: 'Insightful essays and photography guiding the pursuit of clarity, intentional craftsmanship, and decluttered existence.',
    price: 38.00,
    discountPrice: 32.00,
    categorySlug: 'books-stationery',
    stock: 50,
    brand: 'Chronicle Books',
    isFeatured: false,
    tags: ['book', 'minimalism', 'lifestyle'],
    images: [
      { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80', public_id: 'prod_20' }
    ]
  }
];

module.exports = {
  users,
  categories,
  products
};
