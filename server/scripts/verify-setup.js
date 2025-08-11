// Verification script to test the login system setup
import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';
import { AuthService } from '../src/auth/auth.service.js';

async function verifySetup() {
  console.log('🔍 SmartRent Setup Verification\n');

  try {
    // 1. Check environment variables
    console.log('1. Checking environment variables...');
    const requiredVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      console.log('❌ Missing environment variables:', missing.join(', '));
      console.log('   Please copy config.example.env to .env and configure it\n');
      return false;
    }
    console.log('✅ All required environment variables are set\n');

    // 2. Test database connection
    console.log('2. Testing database connection...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Database connection successful\n');

    // 3. Check admin user
    console.log('3. Checking admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartrent.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      console.log('   Run: npm run seed:admin\n');
      return false;
    }
    
    if (adminUser.role !== 'admin') {
      console.log('❌ User found but role is not admin:', adminUser.role);
      return false;
    }
    
    if (!adminUser.isEmailVerified) {
      console.log('❌ Admin user email is not verified');
      adminUser.isEmailVerified = true;
      await adminUser.save();
      console.log('✅ Fixed: Admin email verification status');
    }
    
    console.log('✅ Admin user is properly configured');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Verified: ${adminUser.isEmailVerified}\n`);

    // 4. Test login functionality
    console.log('4. Testing login functionality...');
    const testPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    try {
      const loginResult = await AuthService.login({
        email: adminEmail,
        password: testPassword
      });
      
      if (loginResult.accessToken) {
        console.log('✅ Login test successful');
        console.log('   Access token generated successfully\n');
      } else {
        console.log('❌ Login test failed - no access token returned\n');
        return false;
      }
    } catch (error) {
      console.log('❌ Login test failed:', error.message);
      console.log('   Check your admin password in .env file\n');
      return false;
    }

    // 5. Check email configuration
    console.log('5. Checking email configuration...');
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.log('⚠️  Email configuration missing (GMAIL_USER/GMAIL_PASS)');
      console.log('   OTPs will be logged to console instead of sent via email');
      console.log('   This is okay for development but should be configured for production\n');
    } else {
      console.log('✅ Email configuration found\n');
    }

    console.log('🎉 Setup verification completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the backend: npm run dev');
    console.log('2. Start the frontend: cd ../client && npm run dev');
    console.log('3. Visit: http://localhost:5173/auth/login');
    console.log('4. Login with admin@smartrent.com / admin123');
    
    return true;

  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    return false;
  } finally {
    await mongoose.disconnect();
  }
}

verifySetup()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Verification script error:', err);
    process.exit(1);
  });
