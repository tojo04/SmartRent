// Test authentication flow
import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';
import { AuthService } from '../src/auth/auth.service.js';

async function testAuth() {
  console.log('🧪 Testing Authentication Flow\n');

  try {
    await mongoose.connect(config.mongoUri);
    
    const testEmail = 'test@example.com';
    const testPassword = 'test123';
    const testName = 'Test User';
    
    // Clean up any existing test user
    await User.deleteOne({ email: testEmail });
    console.log('🧹 Cleaned up existing test user');
    
    // Test registration
    console.log('\n1. Testing Registration...');
    try {
      const registerResult = await AuthService.register({
        name: testName,
        email: testEmail,
        password: testPassword
      });
      
      console.log('✅ Registration successful');
      console.log('   requiresVerification:', registerResult.requiresVerification);
      console.log('   message:', registerResult.message);
      console.log('   user:', registerResult.user);
    } catch (error) {
      console.log('❌ Registration failed:', error.message);
      return;
    }
    
    // Test login without verification
    console.log('\n2. Testing Login (without verification)...');
    try {
      const loginResult = await AuthService.login({
        email: testEmail,
        password: testPassword
      });
      
      console.log('✅ Login successful');
      console.log('   accessToken:', loginResult.accessToken ? 'Generated' : 'Missing');
      console.log('   user:', loginResult.user);
    } catch (error) {
      console.log('❌ Login failed:', error.message);
    }
    
    // Check the user in database
    console.log('\n3. Database User Status...');
    const user = await User.findOne({ email: testEmail });
    if (user) {
      console.log(`✅ User found in database`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
    } else {
      console.log('❌ User not found in database');
    }
    
    // Clean up
    await User.deleteOne({ email: testEmail });
    console.log('\n🧹 Test user cleaned up');
    
    console.log('\n🎉 Authentication test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testAuth();
