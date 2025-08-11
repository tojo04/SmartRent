import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, index: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    passwordHash: { type: String, required: true },
    refreshTokenHash: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);

