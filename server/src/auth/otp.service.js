import crypto from 'crypto';
import { User } from '../users/users.model.js';
// Corrected: Changed to a default import (no curly braces)
import NotificationsService from '../notifications/notifications.service.js';

// In-memory OTP store (in production, use Redis or a database for better scalability)
const otpStore = new Map();

export const OTPService = {
  /**
   * Generates a 6-digit OTP, stores it, and sends it via email.
   * @param {string} email - The user's email address.
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async generateOTP(email) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    
    otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
      maxAttempts: 3 // Allow up to 3 verification attempts
    });

    // Send the OTP to the user's email
    await NotificationsService.sendOTPEmail(email, otp);
    
    return { success: true, message: 'OTP sent successfully' };
  },

  /**
   * Verifies the provided OTP against the stored OTP.
   * @param {string} email - The user's email address.
   * @param {string} providedOTP - The OTP provided by the user.
   * @returns {Promise<{success: boolean}>}
   */
  async verifyOTP(email, providedOTP) {
    const otpData = otpStore.get(email);
    
    if (!otpData) {
      throw new Error('OTP not found. Please request a new one.');
    }

    if (new Date() > otpData.expiresAt) {
      otpStore.delete(email);
      throw new Error('OTP has expired. Please request a new one.');
    }

    if (otpData.attempts >= otpData.maxAttempts) {
      otpStore.delete(email);
      throw new Error('Maximum OTP attempts exceeded. Please request a new one.');
    }

    if (otpData.otp !== providedOTP) {
      otpData.attempts++;
      otpStore.set(email, otpData); // Update the attempts count
      throw new Error('Invalid OTP. Please try again.');
    }

    // If OTP is valid, remove it from the store to prevent reuse
    otpStore.delete(email);
    return { success: true };
  },

  /**
   * Checks if a valid OTP exists for a given email.
   * @param {string} email - The user's email address.
   * @returns {boolean}
   */
  hasOTP(email) {
    const otpData = otpStore.get(email);
    return otpData && new Date() <= otpData.expiresAt;
  },

  /**
   * Clears the OTP for a given email.
   * @param {string} email - The user's email address.
   */
  clearOTP(email) {
    otpStore.delete(email);
  },

  /**
   * Gets the number of remaining verification attempts.
   * @param {string} email - The user's email address.
   * @returns {number}
   */
  getRemainingAttempts(email) {
    const otpData = otpStore.get(email);
    if (!otpData) return 0;
    return Math.max(0, otpData.maxAttempts - otpData.attempts);
  }
};
