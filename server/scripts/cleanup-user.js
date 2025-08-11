// Clean up user for testing
import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';

async function cleanupUser() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node scripts/cleanup-user.js <email>');
    console.log('Example: node scripts/cleanup-user.js abcde@gmail.com');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);
    
    const result = await User.deleteOne({ email });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Cleaned up user: ${email}`);
    } else {
      console.log(`ℹ️  No user found with email: ${email}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

cleanupUser();
