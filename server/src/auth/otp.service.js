import crypto from 'crypto';
import { User } from '../users/users.model.js';

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map();

export const OTPService = {
  // Generate and store OTP
  async generateOTP(email) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
      maxAttempts: 3
    });

    // In production, send OTP via email/SMS
    console.log(`OTP for ${email}: ${otp}`);
    
    return { success: true, message: 'OTP sent successfully' };
  },

  // Verify OTP
  async verifyOTP(email, providedOTP) {
    const otpData = otpStore.get(email);
    
    if (!otpData) {
      throw new Error('OTP not found or expired');
    }

    if (new Date() > otpData.expiresAt) {
      otpStore.delete(email);
      throw new Error('OTP has expired');
    }

    if (otpData.attempts >= otpData.maxAttempts) {
      otpStore.delete(email);
      throw new Error('Maximum OTP attempts exceeded');
    }

    if (otpData.otp !== providedOTP) {
      otpData.attempts++;
      throw new Error('Invalid OTP');
    }

    // OTP is valid, remove from store
    otpStore.delete(email);
    return { success: true };
  },

  // Check if OTP exists for email
  hasOTP(email) {
    const otpData = otpStore.get(email);
    return otpData && new Date() <= otpData.expiresAt;
  },

  // Clear OTP for email
  clearOTP(email) {
    otpStore.delete(email);
  },

  // Get remaining attempts
  getRemainingAttempts(email) {
    const otpData = otpStore.get(email);
    if (!otpData) return 0;
    return Math.max(0, otpData.maxAttempts - otpData.attempts);
  }
};