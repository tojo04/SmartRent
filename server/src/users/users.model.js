import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, index: true },
  name:  { type: String, required: true },
  role:  { type: String, enum: ['customer','admin'], default: 'customer' },
  passwordHash: { type: String, required: true },
  // Store a HASH of the refresh token for rotation + compromise mitigation
  refreshTokenHash: { type: String, default: null },
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
