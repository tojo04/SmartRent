import { AuthService } from './auth.service.js';
import { config } from '../config/configuration.js';

function setRefreshCookie(res, token) {
  const maxAgeMs = config.jwt.refreshTtlSec * 1000;
  res.cookie(config.cookies.name, token, {
    httpOnly: true,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: maxAgeMs,
    path: '/auth'
  });
}

export const AuthController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register({ name, email, password });
      
      if (result.requiresVerification) {
        res.status(201).json({ 
          user: result.user, 
          message: result.message,
          requiresVerification: true 
        });
      } else {
        setRefreshCookie(res, result.refreshToken);
        res.status(201).json({ user: result.user, accessToken: result.accessToken });
      }
    } catch (e) {
      res.status(400).json({ message: e.message || 'Registration failed' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      
      if (result.requiresVerification) {
        res.json({ 
          user: result.user, 
          message: result.message,
          requiresVerification: true 
        });
      } else {
        setRefreshCookie(res, result.refreshToken);
        res.json({ user: result.user, accessToken: result.accessToken });
      }
    } catch (e) {
      res.status(401).json({ message: e.message || 'Login failed' });
    }
  },

  // Verify email with OTP
  verifyEmail: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const { user, accessToken, refreshToken, message } = await AuthService.verifyEmail({ email, otp });
      setRefreshCookie(res, refreshToken);
      res.json({ user, accessToken, message });
    } catch (e) {
      res.status(400).json({ message: e.message || 'Email verification failed' });
    }
  },

  // Resend OTP
  resendOTP: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await AuthService.resendOTP({ email });
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message || 'Failed to resend OTP' });
    }
  },

  // Request password reset
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset({ email });
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message || 'Failed to request password reset' });
    }
  },

  // Reset password with OTP
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword, resetToken } = req.body;
      const result = await AuthService.resetPassword({ email, otp, newPassword, resetToken });
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message || 'Password reset failed' });
    }
  },
  // NEW: admin-only login endpoint
  loginAdmin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await AuthService.validateCredentials({ email, password });
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Not an admin account' });
      }
      const { user: publicUser, accessToken, refreshToken } = await AuthService.issueFor(user);
      setRefreshCookie(res, refreshToken);
      res.json({ user: publicUser, accessToken });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Admin login failed' });
    }
  },

  me: async (_req, res) => {
    res.json({ user: res.req.user });
  },

  refresh: async (req, res) => {
    try {
      const refreshToken = req.cookies?.[config.cookies.name];
      if (!refreshToken || !req.userIdFromRefresh) {
        return res.status(401).json({ message: 'Missing refresh context' });
      }
      const { accessToken, refreshToken: newRT } =
        await AuthService.refresh(req.userIdFromRefresh, refreshToken);
      setRefreshCookie(res, newRT);
      res.json({ accessToken });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Could not refresh token' });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie(config.cookies.name, { path: '/auth' });
      const userId = (req.user && req.user.id) || req.userId || req.userIdFromRefresh;
      if (userId) await AuthService.logout(userId);
      res.json({ success: true });
    } catch {
      res.json({ success: true });
    }
  }
};


