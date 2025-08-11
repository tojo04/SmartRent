// Debug current setup with user's specific database configuration
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';
import { prisma } from '../src/db/postgres.js';

async function debugCurrentSetup() {
  console.log('🔍 Debugging Current Setup...\n');

  // Show current configuration
  console.log('📋 Current Configuration:');
  console.log(`   MongoDB: ${config.mongoUri}`);
  console.log(`   PostgreSQL: ${process.env.POSTGRES_URL?.replace(/:[^:]*@/, ':****@')}`);
  console.log(`   Backend Port: ${config.port}`);
  console.log(`   Admin Email: ${config.adminEmail}\n`);

  let mongoConnected = false;
  let postgresConnected = false;

  // Test MongoDB
  console.log('1. Testing MongoDB Connection...');
  try {
    await mongoose.connect(config.mongoUri);
    mongoConnected = true;
    console.log('✅ MongoDB connected successfully');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ email: config.adminEmail });
    if (adminUser) {
      console.log(`✅ Admin user exists (Role: ${adminUser.role}, Verified: ${adminUser.isEmailVerified})`);
    } else {
      console.log('❌ Admin user does not exist');
      
      // Create admin user
      console.log('🔧 Creating admin user...');
      const passwordHash = await bcrypt.hash(config.adminPassword, 12);
      const newAdmin = await User.create({
        email: config.adminEmail,
        name: config.adminName,
        passwordHash,
        role: 'admin',
        isEmailVerified: true
      });
      console.log('✅ Admin user created successfully');
    }
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log(`   Error: ${error.message}`);
  }

  console.log();

  // Test PostgreSQL
  console.log('2. Testing PostgreSQL Connection...');
  try {
    await prisma.$connect();
    postgresConnected = true;
    console.log('✅ PostgreSQL connected successfully');
    
    // Check if tables exist
    try {
      const productCount = await prisma.product.count();
      console.log(`✅ Product table exists (${productCount} products)`);
    } catch (error) {
      console.log('❌ Product tables do not exist');
      console.log('💡 Run: npm run migrate');
    }
  } catch (error) {
    console.log('❌ PostgreSQL connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log('💡 Solutions:');
    console.log('   - Ensure PostgreSQL is running');
    console.log('   - Create database: createdb smartrent');
    console.log('   - Check password in POSTGRES_URL');
  }

  console.log();

  // Test login credentials
  if (mongoConnected) {
    console.log('3. Testing Admin Login Credentials...');
    try {
      const testUser = await User.findOne({ email: config.adminEmail });
      if (testUser) {
        const passwordValid = await bcrypt.compare(config.adminPassword, testUser.passwordHash);
        if (passwordValid) {
          console.log('✅ Admin credentials are valid');
        } else {
          console.log('❌ Admin password is incorrect');
          console.log('🔧 Fixing admin password...');
          const newPasswordHash = await bcrypt.hash(config.adminPassword, 12);
          testUser.passwordHash = newPasswordHash;
          await testUser.save();
          console.log('✅ Admin password fixed');
        }
      }
    } catch (error) {
      console.log(`❌ Credential test failed: ${error.message}`);
    }
  }

  console.log();

  // Final status
  console.log('🎯 Status Summary:');
  console.log(`   MongoDB: ${mongoConnected ? '✅ Ready' : '❌ Not Connected'}`);
  console.log(`   PostgreSQL: ${postgresConnected ? '✅ Ready' : '❌ Not Connected'}`);
  
  if (mongoConnected && postgresConnected) {
    console.log('\n🎉 System Ready!');
    console.log('📱 Login with:');
    console.log(`   Email: ${config.adminEmail}`);
    console.log(`   Password: ${config.adminPassword}`);
    console.log('\n🚀 Start your servers:');
    console.log('   Backend: npm run dev');
    console.log('   Frontend: cd client && npm run dev');
  } else {
    console.log('\n🚨 System Not Ready');
    console.log('📝 Next Steps:');
    if (!mongoConnected) console.log('   - Fix MongoDB connection');
    if (!postgresConnected) console.log('   - Fix PostgreSQL connection & run: npm run migrate');
  }

  // Cleanup
  if (mongoConnected) await mongoose.disconnect();
  if (postgresConnected) await prisma.$disconnect();
}

debugCurrentSetup().catch(console.error);
