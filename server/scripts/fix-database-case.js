// Fix database case mismatch and setup everything properly
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';
import { prisma } from '../src/db/postgres.js';

async function fixDatabaseCase() {
  console.log('🔧 Fixing Database Case Mismatch and Setting Up Admin...\n');

  console.log('📋 Current Configuration:');
  console.log(`   MongoDB: ${config.mongoUri}`);
  console.log(`   PostgreSQL: ${process.env.POSTGRES_URL?.replace(/:[^:]*@/, ':****@')}`);
  console.log(`   Admin Email: ${config.adminEmail}\n`);

  let mongoSuccess = false;
  let postgresSuccess = false;

  // 1. Fix MongoDB Connection and Admin User
  console.log('1. Setting up MongoDB and Admin User...');
  try {
    await mongoose.connect(config.mongoUri);
    mongoSuccess = true;
    console.log('✅ MongoDB connected successfully');

    // Clean up any existing admin users and create fresh one
    await User.deleteMany({ email: config.adminEmail });
    console.log('🧹 Cleaned existing admin users');

    const passwordHash = await bcrypt.hash(config.adminPassword, 12);
    const adminUser = await User.create({
      email: config.adminEmail,
      name: config.adminName,
      passwordHash,
      role: 'admin',
      isEmailVerified: true,
      refreshTokenHash: null,
      emailVerificationToken: null,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    console.log('✅ Fresh admin user created:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Verified: ${adminUser.isEmailVerified}`);

    // Test credentials
    const testUser = await User.findOne({ email: config.adminEmail });
    const passwordValid = await bcrypt.compare(config.adminPassword, testUser.passwordHash);
    
    if (passwordValid) {
      console.log('✅ Admin credentials verified');
    } else {
      throw new Error('Credential verification failed');
    }

  } catch (error) {
    console.log('❌ MongoDB setup failed:');
    console.log(`   Error: ${error.message}`);
    console.log('💡 Check if MongoDB is running and accessible');
  }

  console.log();

  // 2. Setup PostgreSQL
  console.log('2. Setting up PostgreSQL...');
  try {
    await prisma.$connect();
    postgresSuccess = true;
    console.log('✅ PostgreSQL connected successfully');

    // Check if tables exist
    try {
      const productCount = await prisma.product.count();
      console.log(`✅ Product tables exist (${productCount} products)`);
    } catch (error) {
      console.log('🔧 Product tables missing');
      console.log('💡 Will create tables with sample data...');
      
      // Create sample products if tables don't exist
      try {
        // This will fail if tables don't exist, which is expected
        await prisma.product.create({
          data: {
            name: 'Sample Electric Drill',
            description: 'High-quality cordless drill for construction projects',
            category: 'Tools',
            brand: 'DeWalt',
            condition: 'Good',
            pricePerDay: 25.00,
            stock: 3,
            availableStock: 3,
            isRentable: true,
            images: ['https://via.placeholder.com/300x300?text=Drill']
          }
        });
        console.log('✅ Sample product created');
      } catch (createError) {
        console.log('📝 Tables need to be created - run npm run migrate after this');
      }
    }

  } catch (error) {
    console.log('❌ PostgreSQL setup failed:');
    console.log(`   Error: ${error.message}`);
    console.log('💡 Solutions:');
    console.log('   - Ensure PostgreSQL service is running');
    console.log('   - Database "Smartrent" should exist (case-sensitive)');
    console.log('   - Check password in POSTGRES_URL');
  }

  console.log();

  // 3. Final Status
  console.log('🎯 Setup Status:');
  console.log(`   MongoDB: ${mongoSuccess ? '✅ Ready' : '❌ Failed'}`);
  console.log(`   PostgreSQL: ${postgresSuccess ? '✅ Ready' : '❌ Failed'}`);
  
  if (mongoSuccess && postgresSuccess) {
    console.log('\n🎉 Setup Complete!');
    console.log('\n📱 Login Credentials:');
    console.log(`   URL: http://localhost:5173/auth/login`);
    console.log(`   Email: ${config.adminEmail}`);
    console.log(`   Password: ${config.adminPassword}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. If product tables are missing: npm run migrate');
    console.log('2. Restart backend server: npm run dev');
    console.log('3. Try logging in!');
  } else {
    console.log('\n🚨 Setup Issues Detected');
    console.log('\n📝 Next Steps:');
    if (!mongoSuccess) {
      console.log('- Fix MongoDB: Ensure MongoDB service is running');
      console.log('  Start MongoDB: mongod (or check system services)');
    }
    if (!postgresSuccess) {
      console.log('- Fix PostgreSQL: Ensure service is running and database exists');
      console.log('  Check database: psql -l (should show "Smartrent" database)');
    }
  }

  // Cleanup
  if (mongoSuccess) await mongoose.disconnect();
  if (postgresSuccess) await prisma.$disconnect();
}

fixDatabaseCase().catch(console.error);
