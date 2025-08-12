import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Product data for various categories (Prices in Indian Rupees per day)
const productTemplates = {
  'Electronics': [
    { name: 'MacBook Pro 16"', description: 'High-performance laptop with M3 Pro chip, 32GB RAM, 1TB SSD. Perfect for professional work and creative tasks.', priceRange: [1200, 1800], models: ['M3 Pro', 'M3 Max', 'M2 Pro'], brands: ['Apple'] },
    { name: 'Dell XPS 15', description: 'Premium Windows laptop with Intel i7 processor, 16GB RAM, dedicated graphics. Ideal for business and development.', priceRange: [900, 1400], models: ['9530', '9520', '9510'], brands: ['Dell'] },
    { name: 'iPad Pro 12.9"', description: 'Professional tablet with M2 chip, Apple Pencil support, and stunning Liquid Retina display.', priceRange: [600, 900], models: ['6th Gen', '5th Gen'], brands: ['Apple'] },
    { name: 'Canon EOS R5', description: 'Professional mirrorless camera with 45MP sensor, 8K video recording, and advanced autofocus system.', priceRange: [1500, 2200], models: ['R5', 'R6 Mark II'], brands: ['Canon'] },
    { name: 'Sony A7 IV', description: 'Full-frame mirrorless camera with 33MP sensor, excellent low-light performance, and 4K video.', priceRange: [1300, 1900], models: ['A7 IV', 'A7R V'], brands: ['Sony'] },
    { name: 'DJI Mavic 3', description: 'Professional drone with Hasselblad camera, 5.1K video recording, and 46-minute flight time.', priceRange: [1800, 2500], models: ['Mavic 3', 'Mavic 3 Pro'], brands: ['DJI'] },
    { name: 'Gaming Desktop PC', description: 'High-end gaming PC with RTX 4080, Intel i7-13700K, 32GB RAM, perfect for gaming and streaming.', priceRange: [2000, 3000], models: ['Custom Build', 'Pre-built'], brands: ['Custom', 'Alienware', 'ASUS ROG'] },
    { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with A17 Pro chip, titanium design, and advanced camera system.', priceRange: [500, 750], models: ['Pro', 'Pro Max'], brands: ['Apple'] },
    { name: 'Samsung Galaxy S24 Ultra', description: 'Premium Android phone with S Pen, exceptional camera system, and large AMOLED display.', priceRange: [450, 700], models: ['S24 Ultra', 'S23 Ultra'], brands: ['Samsung'] },
    { name: '4K Monitor 32"', description: 'Professional 4K monitor with HDR support, color accuracy, and multiple connectivity options.', priceRange: [600, 900], models: ['32UP550', 'M32UC'], brands: ['LG', 'Samsung', 'Dell'] }
  ],
  'Photography': [
    { name: 'Professional Lens 85mm', description: 'Portrait lens with f/1.4 aperture, perfect for professional photography with beautiful bokeh.', priceRange: [700, 1000], models: ['85mm f/1.4', '85mm f/1.8'], brands: ['Canon', 'Sony', 'Nikon'] },
    { name: 'Camera Tripod Carbon Fiber', description: 'Lightweight yet sturdy carbon fiber tripod for professional photography and videography.', priceRange: [300, 600], models: ['CT-3541', 'GT3543XLS'], brands: ['Manfrotto', 'Gitzo', 'Peak Design'] },
    { name: 'Studio Lighting Kit', description: 'Complete 3-light studio setup with softboxes, stands, and wireless triggers for professional shoots.', priceRange: [800, 1200], models: ['3-Light Kit', '4-Light Kit'], brands: ['Godox', 'Profoto', 'Elinchrom'] },
    { name: 'Wireless Flash Trigger', description: 'High-speed wireless flash trigger system with TTL support and reliable connectivity.', priceRange: [200, 400], models: ['X-Pro III', 'Air 1'], brands: ['Godox', 'PocketWizard'] },
    { name: 'Camera Stabilizer Gimbal', description: '3-axis gimbal stabilizer for DSLR cameras, providing smooth footage for video production.', priceRange: [1000, 1500], models: ['DJI RS 3', 'Zhiyun Crane 3S'], brands: ['DJI', 'Zhiyun'] }
  ],
  'Sports Equipment': [
    { name: 'Mountain Bike', description: 'Full-suspension mountain bike with 29" wheels, perfect for trail riding and outdoor adventures.', priceRange: [800, 1200], models: ['Trail', 'Enduro', 'XC'], brands: ['Trek', 'Specialized', 'Giant'] },
    { name: 'Road Bike', description: 'Lightweight carbon fiber road bike designed for speed and efficiency on paved roads.', priceRange: [600, 1000], models: ['Domane', 'Tarmac', 'TCR'], brands: ['Trek', 'Specialized', 'Giant'] },
    { name: 'Kayak Single', description: 'Single-person recreational kayak, stable and easy to paddle for lake and river adventures.', priceRange: [500, 800], models: ['Recreational', 'Touring'], brands: ['Perception', 'Old Town', 'Wilderness Systems'] },
    { name: 'Surfboard', description: 'High-performance surfboard for intermediate to advanced surfers, perfect for various wave conditions.', priceRange: [600, 900], models: ['Shortboard', 'Longboard', 'Fish'], brands: ['Lost', 'Channel Islands', 'Firewire'] },
    { name: 'Rock Climbing Gear Set', description: 'Complete climbing gear including harness, helmet, ropes, and protection for safe rock climbing.', priceRange: [700, 1000], models: ['Sport Set', 'Trad Set'], brands: ['Black Diamond', 'Petzl', 'Mammut'] },
    { name: 'Ski Set with Boots', description: 'Complete alpine ski set with skis, bindings, boots, and poles for mountain skiing.', priceRange: [1000, 1500], models: ['All-Mountain', 'Carving'], brands: ['Rossignol', 'Salomon', 'Atomic'] },
    { name: 'Paddleboard SUP', description: 'Inflatable stand-up paddleboard with paddle, pump, and carry bag for water adventures.', priceRange: [400, 700], models: ['All-Around', 'Touring'], brands: ['BOTE', 'Red Paddle Co', 'iROCKER'] }
  ],
  'Tools & Equipment': [
    { name: 'Professional Drill Set', description: 'Cordless drill with multiple bits, high torque, and long battery life for professional use.', priceRange: [300, 600], models: ['18V', '20V'], brands: ['DeWalt', 'Milwaukee', 'Makita'] },
    { name: 'Circular Saw', description: 'Professional-grade circular saw with laser guide and dust collection for precise cutting.', priceRange: [400, 700], models: ['7-1/4"', '6-1/2"'], brands: ['DeWalt', 'Milwaukee', 'Bosch'] },
    { name: 'Pressure Washer', description: 'High-pressure washer for cleaning driveways, decks, vehicles, and outdoor surfaces.', priceRange: [500, 800], models: ['Electric', 'Gas'], brands: ['Karcher', 'Sun Joe', 'Simpson'] },
    { name: 'Generator Portable', description: 'Portable generator for outdoor events, camping, and emergency power backup.', priceRange: [700, 1000], models: ['3000W', '5000W'], brands: ['Honda', 'Generac', 'Champion'] },
    { name: 'Welding Machine', description: 'MIG welding machine for metal fabrication and repair work, suitable for various materials.', priceRange: [800, 1200], models: ['MIG 140', 'MIG 180'], brands: ['Lincoln', 'Miller', 'Hobart'] }
  ],
  'Home & Garden': [
    { name: 'Lawn Mower Self-Propelled', description: 'Self-propelled lawn mower with mulching capability and adjustable cutting height.', priceRange: [600, 900], models: ['21"', '22"'], brands: ['Honda', 'Toro', 'Craftsman'] },
    { name: 'Leaf Blower', description: 'Powerful cordless leaf blower for yard cleanup and maintenance work.', priceRange: [300, 500], models: ['Battery', 'Gas'], brands: ['EGO', 'Stihl', 'Husqvarna'] },
    { name: 'Chainsaw', description: 'Professional chainsaw for tree cutting, pruning, and firewood preparation.', priceRange: [700, 1100], models: ['16"', '18"', '20"'], brands: ['Stihl', 'Husqvarna', 'Echo'] },
    { name: 'Garden Tiller', description: 'Gas-powered tiller for soil preparation, perfect for garden beds and landscaping.', priceRange: [800, 1200], models: ['Rear Tine', 'Front Tine'], brands: ['Troy-Bilt', 'Husqvarna', 'Earthquake'] },
    { name: 'Patio Heater', description: 'Propane patio heater for outdoor dining and entertainment areas, extends outdoor season.', priceRange: [400, 600], models: ['Standing', 'Table Top'], brands: ['Fire Sense', 'AZ Patio', 'Hiland'] }
  ],
  'Party & Events': [
    { name: 'Sound System PA', description: 'Professional PA system with wireless microphones, perfect for parties and events.', priceRange: [800, 1300], models: ['Portable', 'Fixed'], brands: ['JBL', 'Bose', 'Yamaha'] },
    { name: 'DJ Controller', description: 'Professional DJ controller with built-in mixer and software for seamless music mixing.', priceRange: [700, 1000], models: ['DDJ-FLX4', 'Mixtrack Pro'], brands: ['Pioneer', 'Numark', 'Denon'] },
    { name: 'Photo Booth Props', description: 'Complete photo booth setup with backdrop, props, and lighting for memorable events.', priceRange: [500, 800], models: ['Backdrop Kit', 'Props Set'], brands: ['Custom', 'Party City'] },
    { name: 'Tent 20x20', description: 'Large event tent suitable for outdoor parties, weddings, and gatherings up to 40 people.', priceRange: [1000, 1500], models: ['Frame Tent', 'Pole Tent'], brands: ['Eurmax', 'ABCCANOPY', 'King Canopy'] },
    { name: 'Tables and Chairs Set', description: 'Round tables (8-person) with matching chairs, perfect for formal events and parties.', priceRange: [300, 600], models: ['Round Table', 'Rectangular'], brands: ['Lifetime', 'Flash Furniture'] },
    { name: 'Bounce House', description: 'Large inflatable bounce house for kids parties and family gatherings, includes blower.', priceRange: [1200, 1800], models: ['Castle', 'Slide Combo'], brands: ['Little Tikes', 'Banzai'] }
  ],
  'Fitness': [
    { name: 'Treadmill Commercial', description: 'Commercial-grade treadmill with incline, heart rate monitoring, and preset programs.', priceRange: [1000, 1500], models: ['Commercial', 'Home'], brands: ['NordicTrack', 'Sole', 'Life Fitness'] },
    { name: 'Weight Set Olympic', description: 'Complete Olympic weight set with barbell, plates, and safety equipment for strength training.', priceRange: [700, 1100], models: ['300lb Set', '500lb Set'], brands: ['Rogue', 'Rep Fitness', 'CAP'] },
    { name: 'Exercise Bike Spin', description: 'Professional spin bike with adjustable resistance and built-in workout programs.', priceRange: [500, 800], models: ['Indoor Cycle', 'Recumbent'], brands: ['Peloton', 'Schwinn', 'NordicTrack'] },
    { name: 'Rowing Machine', description: 'Full-body rowing machine with air resistance and performance monitoring.', priceRange: [600, 900], models: ['Air Rower', 'Water Rower'], brands: ['Concept2', 'WaterRower', 'Hydrow'] }
  ],
  'Musical Instruments': [
    { name: 'Acoustic Guitar', description: 'Professional acoustic guitar with solid wood construction and rich, warm tone.', priceRange: [400, 700], models: ['Dreadnought', 'Concert'], brands: ['Martin', 'Taylor', 'Gibson'] },
    { name: 'Electric Guitar', description: 'Electric guitar with humbucker pickups and versatile tone options for various music styles.', priceRange: [500, 800], models: ['Stratocaster', 'Les Paul'], brands: ['Fender', 'Gibson', 'Epiphone'] },
    { name: 'Digital Piano', description: '88-key digital piano with weighted keys and authentic piano sound samples.', priceRange: [700, 1100], models: ['Stage Piano', 'Console'], brands: ['Yamaha', 'Roland', 'Kawai'] },
    { name: 'Drum Kit Electronic', description: 'Electronic drum kit with mesh heads, multiple sounds, and practice features.', priceRange: [1000, 1500], models: ['5-Piece', '7-Piece'], brands: ['Roland', 'Yamaha', 'Alesis'] },
    { name: 'Violin', description: 'Professional violin with bow and case, suitable for intermediate to advanced players.', priceRange: [600, 1000], models: ['4/4 Size', '3/4 Size'], brands: ['Stentor', 'Yamaha', 'Cecilio'] }
  ],
  'Transportation': [
    { name: 'Electric Scooter', description: 'High-speed electric scooter with long battery life and portable folding design.', priceRange: [300, 600], models: ['Commuter', 'Performance'], brands: ['Xiaomi', 'Segway', 'Razor'] },
    { name: 'Electric Bike', description: 'Electric bike with pedal assist, perfect for commuting and recreational riding.', priceRange: [700, 1100], models: ['City', 'Mountain'], brands: ['Rad Power', 'Trek', 'Specialized'] },
    { name: 'Car Dolly Trailer', description: 'Car dolly trailer for towing vehicles, suitable for moving and transportation needs.', priceRange: [800, 1200], models: ['Tow Dolly', 'Car Trailer'], brands: ['U-Haul', 'Master Tow'] }
  ]
};

// Generate random data helpers
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPrice(priceRange) {
  return getRandomNumber(priceRange[0], priceRange[1]);
}

function getRandomStock() {
  return getRandomNumber(1, 20);
}

function getRandomCondition() {
  const conditions = ['New', 'Good', 'Fair'];
  const weights = [0.3, 0.6, 0.1]; // 30% new, 60% good, 10% fair
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random <= sum) return conditions[i];
  }
  return 'Good';
}

// Generate placeholder image URLs (using data URIs to avoid external dependencies)
function generatePlaceholderImages(productName, category) {
  const colors = ['4F46E5', '7C3AED', 'DB2777', 'DC2626', 'EA580C', '059669', '0891B2'];
  const color = getRandomElement(colors);
  
  return [
    `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#${color}"/>
        <text x="200" y="140" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">${category}</text>
        <text x="200" y="170" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">${productName}</text>
      </svg>
    `).toString('base64')}`,
    `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#${color}AA"/>
        <text x="200" y="150" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">Product Image 2</text>
      </svg>
    `).toString('base64')}`
  ];
}

async function seedProducts() {
  console.log('🌱 Starting product seeding...');
  
  try {
    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    await prisma.product.deleteMany({});
    
    const products = [];
    let productCount = 0;
    const targetProducts = 100;
    
    // Generate products for each category
    const categories = Object.keys(productTemplates);
    
    while (productCount < targetProducts) {
      for (const category of categories) {
        if (productCount >= targetProducts) break;
        
        const templates = productTemplates[category];
        const template = getRandomElement(templates);
        const brand = getRandomElement(template.brands);
        const model = getRandomElement(template.models);
        const stock = getRandomStock();
        
        const product = {
          name: `${template.name} - ${brand} ${model}`,
          description: template.description,
          images: generatePlaceholderImages(template.name, category),
          isRentable: true,
          stock: stock,
          availableStock: stock, // Initially all stock is available
          pricePerDay: getRandomPrice(template.priceRange),
          category: category,
          brand: brand,
          model: model,
          condition: getRandomCondition()
        };
        
        products.push(product);
        productCount++;
      }
    }
    
    // Shuffle products array to randomize order
    for (let i = products.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [products[i], products[j]] = [products[j], products[i]];
    }
    
    // Take only the first 100 products
    const finalProducts = products.slice(0, targetProducts);
    
    // Insert products in batches for better performance
    console.log('📦 Inserting products into database...');
    const batchSize = 10;
    
    for (let i = 0; i < finalProducts.length; i += batchSize) {
      const batch = finalProducts.slice(i, i + batchSize);
      await prisma.product.createMany({
        data: batch
      });
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(finalProducts.length / batchSize)} (${Math.min(i + batchSize, finalProducts.length)}/${finalProducts.length} products)`);
    }
    
    // Get category statistics
    const categoryStats = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });
    
    console.log('\n📊 Seeding Summary:');
    console.log(`✅ Successfully created ${finalProducts.length} products`);
    console.log('\n📋 Products by Category:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat._count.category} products`);
    });
    
    // Get price statistics
    const priceStats = await prisma.product.aggregate({
      _avg: { pricePerDay: true },
      _min: { pricePerDay: true },
      _max: { pricePerDay: true },
      _count: { id: true }
    });
    
    console.log('\n💰 Price Statistics:');
    console.log(`   Average: ₹${Number(priceStats._avg.pricePerDay).toFixed(2)}/day`);
    console.log(`   Range: ₹${Number(priceStats._min.pricePerDay).toFixed(2)} - ₹${Number(priceStats._max.pricePerDay).toFixed(2)}/day`);
    
    // Get stock statistics
    const stockStats = await prisma.product.aggregate({
      _avg: { stock: true },
      _sum: { stock: true },
      _min: { stock: true },
      _max: { stock: true }
    });
    
    console.log('\n📦 Stock Statistics:');
    console.log(`   Total Units: ${stockStats._sum.stock}`);
    console.log(`   Average per Product: ${Number(stockStats._avg.stock).toFixed(1)} units`);
    console.log(`   Range: ${stockStats._min.stock} - ${stockStats._max.stock} units`);
    
    console.log('\n🎉 Product seeding completed successfully!');
    console.log('\n🚀 You can now:');
    console.log('   • Start your server: npm run dev');
    console.log('   • Browse products in the admin panel');
    console.log('   • Test the customer rental flow');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔗 Connecting to PostgreSQL...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully');
    
    await seedProducts();
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the seeding script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
