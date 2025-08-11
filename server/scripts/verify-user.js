// Script to manually verify a user for development purposes
import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';

async function verifyUser() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node scripts/verify-user.js <email>');
    console.log('Example: node scripts/verify-user.js abcde@gmail.com');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }
    
    if (user.isEmailVerified) {
      console.log(`✅ User ${email} is already verified`);
    } else {
      user.isEmailVerified = true;
      await user.save();
      console.log(`✅ User ${email} has been verified successfully`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

verifyUser();
