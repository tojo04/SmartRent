// Simple database connection checker
import 'dotenv/config';

async function checkDatabases() {
  console.log('🔍 Checking database connections...\n');

  // Check environment variables
  console.log('📋 Environment Configuration:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   PORT: ${process.env.PORT}`);
  console.log(`   MONGO_URI: ${process.env.MONGO_URI}`);
  console.log(`   POSTGRES_URL: ${process.env.POSTGRES_URL ? 'Set' : 'Missing'}\n`);

  // Test MongoDB
  console.log('1. Testing MongoDB...');
  try {
    const mongoose = await import('mongoose');
    await mongoose.default.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connection successful');
    await mongoose.default.disconnect();
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log('   💡 Solution: Ensure MongoDB is running on localhost:27017');
  }

  console.log();

  // Test PostgreSQL
  console.log('2. Testing PostgreSQL...');
  try {
    const { prisma } = await import('../src/db/postgres.js');
    await prisma.$connect();
    console.log('✅ PostgreSQL connection successful');
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ PostgreSQL connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log('   💡 Solutions:');
    console.log('     - Install PostgreSQL: https://postgresql.org/download/');
    console.log('     - Create database: createdb smartrent_products');
    console.log('     - Update POSTGRES_URL in .env with correct credentials');
    console.log('     - Default: postgresql://postgres:password@localhost:5432/smartrent_products');
  }

  console.log('\n🔧 Quick Fix Commands:');
  console.log('   Fix login issues: npm run fix-login');
  console.log('   Setup PostgreSQL: npm run migrate');
  console.log('   Create admin user: npm run seed:admin');
}

checkDatabases();
