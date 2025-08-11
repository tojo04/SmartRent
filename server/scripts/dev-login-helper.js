// Development helper to see OTP and complete verification flow
import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';
import { OTPService } from '../src/auth/otp.service.js';
import { AuthService } from '../src/auth/auth.service.js';

async function devLoginHelper() {
  const email = process.argv[2];
  const action = process.argv[3] || 'check';
  
  if (!email) {
    console.log('Development Login Helper');
    console.log('Usage: node scripts/dev-login-helper.js <email> [action]');
    console.log('Actions:');
    console.log('  check     - Check user status (default)');
    console.log('  verify    - Manually verify email');
    console.log('  otp       - Generate and show OTP');
    console.log('  login     - Test login flow');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/dev-login-helper.js abcde@gmail.com check');
    console.log('  node scripts/dev-login-helper.js abcde@gmail.com verify');
    console.log('  node scripts/dev-login-helper.js abcde@gmail.com otp');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }
    
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🔐 Role: ${user.role}`);
    console.log(`✉️ Email Verified: ${user.isEmailVerified}`);
    console.log('');
    
    switch (action) {
      case 'check':
        if (user.isEmailVerified) {
          console.log('✅ User can login');
        } else {
          console.log('⚠️ User needs email verification before login');
          console.log('   Run: npm run dev-login-helper ' + email + ' verify');
        }
        break;
        
      case 'verify':
        if (user.isEmailVerified) {
          console.log('✅ User is already verified');
        } else {
          user.isEmailVerified = true;
          await user.save();
          console.log('✅ User manually verified - can now login');
        }
        break;
        
      case 'otp':
        if (user.isEmailVerified) {
          console.log('ℹ️ User is already verified, OTP not needed');
        } else {
          console.log('📧 Generating OTP...');
          await OTPService.generateOTP(email);
          console.log('✅ OTP generated (check console output above for the code)');
          console.log('💡 Use this OTP in the verification form');
        }
        break;
        
      case 'login':
        console.log('🔑 Testing login flow...');
        try {
          const result = await AuthService.login({ email, password: 'test123' });
          if (result.requiresVerification) {
            console.log('⚠️ Login requires email verification');
            console.log('   Generate OTP: npm run dev-login-helper ' + email + ' otp');
            console.log('   Or verify manually: npm run dev-login-helper ' + email + ' verify');
          } else {
            console.log('✅ Login would succeed');
          }
        } catch (error) {
          console.log('❌ Login failed:', error.message);
          console.log('💡 Note: This test uses password "test123"');
        }
        break;
        
      default:
        console.log('❌ Unknown action:', action);
        process.exit(1);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

devLoginHelper();
