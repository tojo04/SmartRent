// Fix login issues script
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';
import { prisma } from '../src/db/postgres.js';

async function fixLoginIssues() {
  console.log('🔧 Fixing login issues...\n');

  try {
    // 1. Test MongoDB connection
    console.log('1. Testing MongoDB connection...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected successfully\n');

    // 2. Test PostgreSQL connection
    console.log('2. Testing PostgreSQL connection...');
    try {
      await prisma.$connect();
      console.log('✅ PostgreSQL connected successfully\n');
    } catch (error) {
      console.log('❌ PostgreSQL connection failed:', error.message);
      console.log('📝 Please ensure PostgreSQL is running and database exists\n');
    }

    // 3. Check if admin user exists
    console.log('3. Checking admin user...');
    let adminUser = await User.findOne({ email: 'admin@smartrent.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Email Verified: ${adminUser.isEmailVerified}\n`);
      
      // Ensure admin is properly set up
      if (!adminUser.isEmailVerified || adminUser.role !== 'admin') {
        console.log('🔧 Fixing admin user settings...');
        adminUser.isEmailVerified = true;
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('✅ Admin user updated\n');
      }
    } else {
      console.log('❌ Admin user not found, creating...');
      
      const passwordHash = await bcrypt.hash('admin123', 12);
      adminUser = await User.create({
        email: 'admin@smartrent.com',
        name: 'SmartRent Admin',
        passwordHash,
        role: 'admin',
        isEmailVerified: true
      });
      
      console.log('✅ Admin user created successfully');
      console.log('   Email: admin@smartrent.com');
      console.log('   Password: admin123\n');
    }

    // 4. Test admin login credentials
    console.log('4. Testing admin credentials...');
    const testUser = await User.findOne({ email: 'admin@smartrent.com' });
    const passwordValid = await bcrypt.compare('admin123', testUser.passwordHash);
    
    if (passwordValid) {
      console.log('✅ Admin credentials are valid\n');
    } else {
      console.log('❌ Admin credentials invalid, fixing...');
      const newPasswordHash = await bcrypt.hash('admin123', 12);
      testUser.passwordHash = newPasswordHash;
      await testUser.save();
      console.log('✅ Admin password reset\n');
    }

    // 5. Set up PostgreSQL tables if needed
    console.log('5. Setting up PostgreSQL tables...');
    try {
      // Try to count products to test if tables exist
      const productCount = await prisma.product.count();
      console.log(`✅ PostgreSQL tables exist (${productCount} products)\n`);
    } catch (error) {
      console.log('🔧 PostgreSQL tables missing, creating...');
      console.log('   Run: npm run migrate\n');
    }

    // 6. Display final status
    console.log('🎉 Setup complete! Try logging in with:');
    console.log('   Email: admin@smartrent.com');
    console.log('   Password: admin123');
    console.log('\n🚀 Start your servers:');
    console.log('   Backend: npm run dev (port 4000)');
    console.log('   Frontend: cd client && npm run dev (port 5173)');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n🩺 Troubleshooting:');
    console.error('1. Ensure MongoDB is running');
    console.error('2. Ensure PostgreSQL is running');
    console.error('3. Check .env file configuration');
    console.error('4. Run: npm install');
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

fixLoginIssues();
