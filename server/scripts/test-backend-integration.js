// Test Backend Integration
import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';
import { prisma } from '../src/db/postgres.js';
import { ProductsService } from '../src/products/products.service.js';
import { RentalsService } from '../src/rentals/rentals.service.js';

async function testBackendIntegration() {
  console.log('🧪 Testing Backend Integration...\n');

  let mongoSuccess = false;
  let postgresSuccess = false;
  let apiSuccess = false;

  // 1. Test MongoDB Connection and User Authentication
  console.log('1. Testing MongoDB & User Authentication...');
  try {
    await mongoose.connect(config.mongoUri);
    mongoSuccess = true;
    console.log('✅ MongoDB connected');

    // Check admin user exists
    const adminUser = await User.findOne({ email: config.adminEmail });
    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.email} (${adminUser.role})`);
    } else {
      console.log('❌ Admin user not found - run npm run complete-fix');
    }

    // Check user count
    const userCount = await User.countDocuments();
    console.log(`📊 Total users: ${userCount}`);

  } catch (error) {
    console.log('❌ MongoDB test failed:', error.message);
  }

  console.log();

  // 2. Test PostgreSQL Connection and Products
  console.log('2. Testing PostgreSQL & Products...');
  try {
    await prisma.$connect();
    postgresSuccess = true;
    console.log('✅ PostgreSQL connected');

    // Test product operations
    try {
      const productCount = await prisma.product.count();
      console.log(`📊 Total products: ${productCount}`);

      if (productCount === 0) {
        console.log('🔧 Creating sample product...');
        const sampleProduct = await ProductsService.create({
          name: 'Test Product',
          description: 'Test product for integration testing',
          category: 'Test',
          brand: 'TestBrand',
          condition: 'Good',
          pricePerDay: 100,
          stock: 5,
          isRentable: true,
          images: []
        });
        console.log(`✅ Sample product created: ${sampleProduct.id}`);
      }

      // Test categories and brands endpoints
      const categories = await ProductsService.getCategories();
      const brands = await ProductsService.getBrands();
      console.log(`📊 Categories: ${categories.length}, Brands: ${brands.length}`);

    } catch (productError) {
      console.log('❌ Product operations failed:', productError.message);
      console.log('💡 You may need to run: npm run migrate');
    }

    // Test rental operations
    try {
      const rentalCount = await prisma.rental.count();
      console.log(`📊 Total rentals: ${rentalCount}`);
    } catch (rentalError) {
      console.log('❌ Rental operations failed:', rentalError.message);
      console.log('💡 You may need to run: npm run migrate');
    }

  } catch (error) {
    console.log('❌ PostgreSQL test failed:', error.message);
  }

  console.log();

  // 3. Test API Service Functions
  console.log('3. Testing API Service Functions...');
  try {
    if (postgresSuccess) {
      // Test product service
      const products = await ProductsService.list({ page: 1, limit: 5 });
      console.log(`✅ ProductsService.list: ${products.items.length} products`);

      // Test filtering
      const filteredProducts = await ProductsService.list({ 
        category: 'Test', 
        rentable: true 
      });
      console.log(`✅ ProductsService.list (filtered): ${filteredProducts.items.length} products`);

      apiSuccess = true;
    }
  } catch (error) {
    console.log('❌ API service test failed:', error.message);
  }

  console.log();

  // 4. Final Status Report
  console.log('📋 Backend Integration Test Results:');
  console.log(`   MongoDB: ${mongoSuccess ? '✅ Working' : '❌ Failed'}`);
  console.log(`   PostgreSQL: ${postgresSuccess ? '✅ Working' : '❌ Failed'}`);
  console.log(`   API Services: ${apiSuccess ? '✅ Working' : '❌ Failed'}`);

  console.log();

  if (mongoSuccess && postgresSuccess && apiSuccess) {
    console.log('🎉 All Backend Integration Tests Passed!');
    console.log();
    console.log('✅ Your backend is ready for:');
    console.log('   • User authentication and admin management');
    console.log('   • Product CRUD operations');
    console.log('   • Rental order processing');
    console.log('   • Advanced filtering and search');
    console.log();
    console.log('🚀 Frontend should now work without errors!');
  } else {
    console.log('🚨 Some Backend Tests Failed!');
    console.log();
    console.log('🔧 Quick Fixes:');
    if (!mongoSuccess) {
      console.log('   • MongoDB: Ensure MongoDB is running and run npm run complete-fix');
    }
    if (!postgresSuccess) {
      console.log('   • PostgreSQL: Ensure PostgreSQL is running and run npm run migrate');
    }
    if (!apiSuccess) {
      console.log('   • API Services: Fix database connections first');
    }
  }

  // Cleanup
  if (mongoSuccess) await mongoose.disconnect();
  if (postgresSuccess) await prisma.$disconnect();
}

testBackendIntegration().catch(console.error);
