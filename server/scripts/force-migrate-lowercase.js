// Force migrate for lowercase database names
import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function forceMigrateLowercase() {
  console.log('🔄 Force Migration for Lowercase Database...\n');

  try {
    console.log('1. Generating Prisma client...');
    await execAsync('npx prisma generate');
    console.log('✅ Prisma client generated\n');

    console.log('2. Resetting database (this will recreate all tables)...');
    await execAsync('npx prisma migrate reset --force');
    console.log('✅ Database reset completed\n');

    console.log('3. Applying migrations...');
    await execAsync('npx prisma migrate deploy');
    console.log('✅ Migrations applied\n');

    console.log('4. Seeding sample data...');
    await seedSampleData();
    console.log('✅ Sample data created\n');

    console.log('🎉 Database migration complete!');
    console.log('\n📝 What was done:');
    console.log('- ✅ PostgreSQL tables created in "smartrent" database');
    console.log('- ✅ Sample products added');
    console.log('- ✅ Ready for rentals system');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Restart backend server: npm run dev');
    console.log('2. Login with admin credentials');
    console.log('3. Test the full system!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure PostgreSQL is running');
    console.error('2. Ensure database "smartrent" exists: createdb smartrent');
    console.error('3. Check POSTGRES_URL in .env file');
    
    console.error('\n🆘 Manual fix:');
    console.error('createdb smartrent');
    console.error('npm run setup-lowercase');
  }
}

async function seedSampleData() {
  try {
    const { prisma } = await import('../src/db/postgres.js');
    
    const sampleProducts = [
      {
        name: 'Professional Electric Drill',
        description: 'High-quality cordless drill perfect for construction and home improvement projects.',
        category: 'Tools',
        brand: 'DeWalt',
        model: 'DCD771C2',
        condition: 'Good',
        pricePerDay: 25.00,
        stock: 5,
        availableStock: 5,
        isRentable: true,
        images: ['https://via.placeholder.com/300x300?text=Drill']
      },
      {
        name: 'Gas-Powered Lawn Mower',
        description: 'Self-propelled lawn mower with mulching capability and adjustable height.',
        category: 'Garden',
        brand: 'Honda',
        model: 'HRR216VKA',
        condition: 'Good',
        pricePerDay: 35.00,
        stock: 3,
        availableStock: 3,
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
        name: 'Camping Chair Set (4 chairs)',
        description: 'Set of 4 comfortable folding chairs perfect for camping or outdoor events.',
        category: 'Outdoor',
        brand: 'Coleman',
        model: 'Quad Chair Set',
        condition: 'Good',
        pricePerDay: 20.00,
        stock: 6,
        availableStock: 6,
        isRentable: true,
        images: ['https://via.placeholder.com/300x300?text=Chairs']
      }
    ];

    for (const product of sampleProducts) {
      await prisma.product.create({ data: product });
    }

    console.log(`   Created ${sampleProducts.length} sample products`);
    await prisma.$disconnect();
  } catch (error) {
    console.error('   Failed to seed sample data:', error.message);
  }
}

forceMigrateLowercase();
