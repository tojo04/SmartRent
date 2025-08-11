// Complete reset for new database configuration
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';
import { prisma } from '../src/db/postgres.js';

async function completeReset() {
  console.log('🔄 Complete Reset for New Database Configuration...\n');

  try {
    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log(`✅ Connected to MongoDB: ${config.mongoUri}`);

    // 2. Clean and recreate admin user
    console.log('\n2. Setting up admin user...');
    
    // Remove any existing admin user
    await User.deleteMany({ email: config.adminEmail });
    console.log('🧹 Cleaned existing admin user');
    
    // Create fresh admin user
    const passwordHash = await bcrypt.hash(config.adminPassword, 12);
    const adminUser = await User.create({
      email: config.adminEmail,
      name: config.adminName,
      passwordHash,
      role: 'admin',
      isEmailVerified: true,
      refreshTokenHash: null
    });
    
    console.log('✅ Created fresh admin user:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Verified: ${adminUser.isEmailVerified}`);

    // 3. Test admin credentials
    console.log('\n3. Testing admin credentials...');
    const testUser = await User.findOne({ email: config.adminEmail });
    const passwordValid = await bcrypt.compare(config.adminPassword, testUser.passwordHash);
    
    if (passwordValid) {
      console.log('✅ Admin credentials are valid');
    } else {
      throw new Error('Admin credentials test failed');
    }

    // 4. Connect to PostgreSQL
    console.log('\n4. Setting up PostgreSQL...');
    try {
      await prisma.$connect();
      console.log('✅ Connected to PostgreSQL');
      
      // Check if tables exist by trying to count products
      try {
        const count = await prisma.product.count();
        console.log(`✅ PostgreSQL tables exist (${count} products)`);
      } catch (error) {
        console.log('🔧 PostgreSQL tables missing, they need to be created');
        console.log('💡 After this script, run: npm run migrate');
      }
    } catch (error) {
      console.log(`❌ PostgreSQL connection failed: ${error.message}`);
      console.log('💡 Ensure PostgreSQL is running and database "smartrent" exists');
    }

    console.log('\n🎉 Reset Complete!');
    console.log('\n📱 Login Credentials:');
    console.log(`   URL: http://localhost:5173/auth/login`);
    console.log(`   Email: ${config.adminEmail}`);
    console.log(`   Password: ${config.adminPassword}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. If PostgreSQL tables are missing: npm run migrate');
    console.log('2. Start backend: npm run dev');
    console.log('3. Start frontend: cd client && npm run dev');
    console.log('4. Try logging in!');

  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('- Ensure MongoDB is running');
    console.error('- Ensure PostgreSQL is running');
    console.error('- Check database credentials in .env');
    console.error('- Create PostgreSQL database: createdb smartrent');
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

completeReset();
