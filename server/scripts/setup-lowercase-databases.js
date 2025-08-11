// Complete setup for lowercase database names
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';
import { prisma } from '../src/db/postgres.js';

async function setupLowercaseDatabases() {
  console.log('🔧 Setting Up Lowercase Databases (smartrent)...\n');

  console.log('📋 Current Configuration:');
  console.log(`   MongoDB: ${config.mongoUri}`);
  console.log(`   PostgreSQL: ${process.env.POSTGRES_URL?.replace(/:[^:]*@/, ':****@')}`);
  console.log(`   Admin Email: ${config.adminEmail}\n`);

  let mongoSuccess = false;
  let postgresSuccess = false;

  // 1. Setup MongoDB with admin user
  console.log('1. Setting up MongoDB (smartrent database)...');
  try {
    await mongoose.connect(config.mongoUri);
    mongoSuccess = true;
    console.log('✅ MongoDB connected successfully');

    // Count existing users
    const userCount = await User.countDocuments();
    console.log(`📊 Found ${userCount} existing users`);

    // Check if admin user exists
    let adminUser = await User.findOne({ email: config.adminEmail });
    
    if (adminUser) {
      console.log('👤 Admin user already exists');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Verified: ${adminUser.isEmailVerified}`);

      // Update admin user to ensure proper settings
      adminUser.role = 'admin';
      adminUser.isEmailVerified = true;
      const passwordHash = await bcrypt.hash(config.adminPassword, 12);
      adminUser.passwordHash = passwordHash;
      await adminUser.save();
      console.log('🔄 Admin user updated with fresh credentials');
    } else {
      console.log('🔧 Creating new admin user...');
      const passwordHash = await bcrypt.hash(config.adminPassword, 12);
      adminUser = await User.create({
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
      console.log('✅ Admin user created successfully');
    }

    // Test admin credentials
    const testUser = await User.findOne({ email: config.adminEmail });
    const passwordValid = await bcrypt.compare(config.adminPassword, testUser.passwordHash);
    
    if (passwordValid) {
      console.log('✅ Admin credentials verified');
    } else {
      throw new Error('Admin credential verification failed');
    }

    // Show final user stats
    const finalUserCount = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const customerCount = await User.countDocuments({ role: 'customer' });
    console.log(`📊 Final stats: ${finalUserCount} total (${adminCount} admins, ${customerCount} customers)`);

  } catch (error) {
    console.log('❌ MongoDB setup failed:');
    console.log(`   Error: ${error.message}`);
    console.log('💡 Solutions:');
    console.log('   - Ensure MongoDB service is running');
    console.log('   - Check MongoDB connection string');
  }

  console.log();

  // 2. Setup PostgreSQL
  console.log('2. Setting up PostgreSQL (smartrent database)...');
  try {
    await prisma.$connect();
    postgresSuccess = true;
    console.log('✅ PostgreSQL connected successfully');

    // Test if tables exist by trying to count products
    try {
      const productCount = await prisma.product.count();
      console.log(`📊 Found ${productCount} existing products`);
      
      // If no products exist, create a few sample ones
      if (productCount === 0) {
        console.log('🔧 Creating sample products...');
        
        const sampleProducts = [
          {
            name: 'Professional Electric Drill',
            description: 'High-quality cordless drill perfect for construction and home improvement projects.',
            category: 'Tools',
            brand: 'DeWalt',
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
            condition: 'Good',
            pricePerDay: 35.00,
            stock: 2,
            availableStock: 2,
            isRentable: true,
            images: ['https://via.placeholder.com/300x300?text=Mower']
          },
          {
            name: 'Party Tent 10x10',
            description: 'Spacious party tent perfect for outdoor events.',
            category: 'Events',
            brand: 'Coleman',
            condition: 'Good',
            pricePerDay: 75.00,
            stock: 4,
            availableStock: 4,
            isRentable: true,
            images: ['https://via.placeholder.com/300x300?text=Tent']
          }
        ];

        for (const product of sampleProducts) {
          await prisma.product.create({ data: product });
        }
        
        console.log(`✅ Created ${sampleProducts.length} sample products`);
      }
      
    } catch (tableError) {
      console.log('🔧 Database tables missing, they need to be created');
      console.log('💡 Run: npm run migrate (after this script completes)');
    }

  } catch (error) {
    console.log('❌ PostgreSQL setup failed:');
    console.log(`   Error: ${error.message}`);
    console.log('💡 Solutions:');
    console.log('   - Ensure PostgreSQL service is running');
    console.log('   - Create database: createdb smartrent');
    console.log('   - Check credentials in POSTGRES_URL');
  }

  console.log();

  // 3. Final Status & Instructions
  console.log('🎯 Setup Status:');
  console.log(`   MongoDB: ${mongoSuccess ? '✅ Ready' : '❌ Failed'}`);
  console.log(`   PostgreSQL: ${postgresSuccess ? '✅ Ready' : '❌ Failed'}`);
  
  if (mongoSuccess && postgresSuccess) {
    console.log('\n🎉 Databases Setup Complete!');
    console.log('\n📱 Login Credentials:');
    console.log(`   URL: http://localhost:5173/auth/login`);
    console.log(`   Email: ${config.adminEmail}`);
    console.log(`   Password: ${config.adminPassword}`);
    
    console.log('\n🚀 Final Steps:');
    console.log('1. Stop your backend server (Ctrl+C)');
    console.log('2. If PostgreSQL tables missing: npm run migrate');
    console.log('3. Restart backend: npm run dev');
    console.log('4. Refresh frontend and try logging in!');
    
    console.log('\n✅ Expected Result:');
    console.log('- No more 401/400 errors in browser console');
    console.log('- Successful login and redirect to admin dashboard');
    console.log('- Admin panel with products, users, orders working');
    
  } else {
    console.log('\n🚨 Setup Issues:');
    if (!mongoSuccess) {
      console.log('❌ MongoDB: Fix connection and re-run this script');
    }
    if (!postgresSuccess) {
      console.log('❌ PostgreSQL: Fix connection, create database, re-run script');
      console.log('   Create DB: createdb smartrent');
    }
  }

  // Cleanup connections
  if (mongoSuccess) await mongoose.disconnect();
  if (postgresSuccess) await prisma.$disconnect();
}

setupLowercaseDatabases().catch(console.error);
