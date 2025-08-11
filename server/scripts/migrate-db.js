// Database migration script
import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function migrateDatabase() {
  console.log('🗄️ Running database migrations...\n');

  try {
    // Generate Prisma client
    console.log('1. Generating Prisma client...');
    await execAsync('npx prisma generate');
    console.log('✅ Prisma client generated\n');

    // Run migrations
    console.log('2. Running database migrations...');
    await execAsync('npx prisma migrate dev --name init_rental_system');
    console.log('✅ Database migrations completed\n');

    // Optional: Seed some sample data
    console.log('3. Seeding sample products...');
    await seedSampleData();
    console.log('✅ Sample data seeded\n');

    console.log('🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Ensure PostgreSQL is running');
    console.log('2. Update POSTGRES_URL in .env file');
    console.log('3. Start the development server: npm run dev');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if PostgreSQL is running');
    console.error('2. Verify POSTGRES_URL in .env file');
    console.error('3. Ensure database exists and is accessible');
    process.exit(1);
  }
}

async function seedSampleData() {
  const { prisma } = await import('../src/db/postgres.js');
  
  try {
    // Sample products
    const sampleProducts = [
      {
        name: 'Professional Drill',
        description: 'High-quality cordless drill perfect for construction and home improvement projects.',
        category: 'Tools',
        brand: 'DeWalt',
        model: 'DCD771C2',
        condition: 'Good',
        pricePerDay: 25.00,
        stock: 3,
        availableStock: 3,
        isRentable: true,
        images: ['https://via.placeholder.com/300x300?text=Drill']
      },
      {
        name: 'Lawn Mower',
        description: 'Self-propelled lawn mower with mulching capability.',
        category: 'Garden',
        brand: 'Honda',
        model: 'HRR216VKA',
        condition: 'Good',
        pricePerDay: 35.00,
        stock: 2,
        availableStock: 2,
        isRentable: true,
        images: ['https://via.placeholder.com/300x300?text=Mower']
      },
      {
        name: 'Party Tent 10x10',
        description: 'Spacious party tent perfect for outdoor events and gatherings.',
        category: 'Events',
        brand: 'Coleman',
        model: 'Event Shelter',
        condition: 'Good',
        pricePerDay: 75.00,
        stock: 4,
        availableStock: 4,
        isRentable: true,
        images: ['https://via.placeholder.com/300x300?text=Tent']
      },
      {
        name: 'Pressure Washer',
        description: 'Electric pressure washer for cleaning driveways, decks, and outdoor furniture.',
        category: 'Cleaning',
        brand: 'Karcher',
        model: 'K5 Premium',
        condition: 'New',
        pricePerDay: 45.00,
        stock: 2,
        availableStock: 2,
        isRentable: true,
        images: ['https://via.placeholder.com/300x300?text=Washer']
      },
      {
        name: 'Camping Chair Set',
        description: 'Set of 4 comfortable folding chairs perfect for camping or outdoor events.',
        category: 'Outdoor',
        brand: 'Coleman',
        model: 'Quad Chair',
        condition: 'Good',
        pricePerDay: 20.00,
        stock: 5,
        availableStock: 5,
        isRentable: true,
        images: ['https://via.placeholder.com/300x300?text=Chairs']
      }
    ];

    for (const product of sampleProducts) {
      await prisma.product.create({
        data: product
      });
    }

    console.log(`   Created ${sampleProducts.length} sample products`);
  } catch (error) {
    console.error('   Failed to seed sample data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDatabase();
