import { AuthService } from './auth.service.js';
import { config } from '../config/configuration.js';
import jwt from 'jsonwebtoken';

function setRefreshCookie(res, token, { persist = true } = {}) {
  const isProd = process.env.NODE_ENV === 'production';

  const cookieBase = {
    httpOnly: true,
    secure: isProd,                         // secure only for HTTPS
    sameSite: isProd ? 'strict' : 'lax',    // lax in dev for local testing
    path: '/',                               // allow cookie for all routes
  };

  const options = persist
    ? { ...cookieBase, maxAge: config.jwt.refreshTtlSec * 1000 } // persistent cookie
    : cookieBase; // session cookie

  res.cookie(config.cookies.name, token, options);
}


export const AuthController = {
  register: async (req, res) => {
    try {
      const { name, email, password, rememberMe } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.register({ name, email, password });
      setRefreshCookie(res, refreshToken, { persist: !!rememberMe });
      res.status(201).json({ user, accessToken });
    } catch (e) {
      res.status(400).json({ message: e.message || 'Registration failed' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login({ email, password });
      setRefreshCookie(res, refreshToken, { persist: !!rememberMe });
      res.json({ user, accessToken });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Login failed' });
    }
  },

  me: async (req, res) => {
    res.json({ user: req.user });
  },

  refresh: async (req, res) => {
    try {
      const refreshToken = req.cookies?.[config.cookies.name];
      if (!refreshToken) {
        return res.status(401).json({ message: 'Missing refresh token' });
      }

      // Derive userId directly from the refresh token
      let userId;
      try {
        userId = jwt.verify(refreshToken, config.jwt.refreshSecret).sub;
      } catch {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const { accessToken, refreshToken: newRT } =
        await AuthService.refresh(userId, refreshToken);
      const persist = Boolean(req.body?.persist);
      setRefreshCookie(res, newRT, { persist });
      res.json({ accessToken });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Could not refresh token' });
    }
  },

  logout: async (req, res) => {
    try {
      // Always clear client cookie
      res.clearCookie(config.cookies.name, { path: '/auth' });
      res.clearCookie(config.cookies.name, { path: '/' });

      // Invalidate server-side token hash (fix)
      const userId =
        (req.user && req.user.id) ||
        req.userId ||
        req.userIdFromRefresh;

      if (userId) await AuthService.logout(userId);

      res.json({ success: true });
    } catch {
      res.json({ success: true });
    }
  }
};

