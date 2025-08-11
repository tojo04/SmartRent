import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../src/config/configuration.js';
import { User } from '../src/users/users.model.js';

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe!123';
  const name = process.env.ADMIN_NAME || 'Super Admin';
  if (!email) { console.error('Set ADMIN_EMAIL'); process.exit(1); }

  await mongoose.connect(config.mongoUri);

  let user = await User.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 12);

  if (!user) {
    user = await User.create({ email, name, passwordHash, role: 'admin' });
    console.log(`Created admin ${email}`);
  } else {
    user.role = 'admin';
    user.passwordHash = passwordHash;
    await user.save();
    console.log(`Updated existing user ${email} to admin`);
  }

  await mongoose.disconnect();
}
main().catch(err => { console.error(err); process.exit(1); });
