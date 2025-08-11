import { AuthService } from './auth.service.js';
import { config } from '../config/configuration.js';

function setRefreshCookie(res, token) {
  const maxAgeMs = config.jwt.refreshTtlSec * 1000;
  res.cookie(config.cookies.name, token, {
    httpOnly: true,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: maxAgeMs,
    path: '/auth', // limit scope
  });
}

export const AuthController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.register({ name, email, password });

      setRefreshCookie(res, refreshToken);
      res.status(201).json({ user, accessToken });
    } catch (e) {
      res.status(400).json({ message: e.message || 'Registration failed' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login({ email, password });

      setRefreshCookie(res, refreshToken);
      res.json({ user, accessToken });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Login failed' });
    }
  },

  me: async (req, res) => {
    // req.user is set by auth middleware
    res.json({ user: req.user });
  },

  refresh: async (req, res) => {
    try {
      const refreshToken = req.cookies?.[config.cookies.name];
      if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' });

      const { accessToken, refreshToken: newRT } = await AuthService.refresh(req.userIdFromRefresh ?? null, refreshToken);

      // Rotation: replace cookie
      setRefreshCookie(res, newRT);
      res.json({ accessToken });
    } catch (e) {
      res.status(401).json({ message: e.message || 'Could not refresh token' });
    }
  },

  logout: async (req, res) => {
    try {
      const refreshToken = req.cookies?.[config.cookies.name];
      res.clearCookie(config.cookies.name, { path: '/auth' });
      if (req.user?.id) await AuthService.logout(req.user.id);
      // Even if no user, clear cookie and return ok (idempotent)
      res.json({ success: true });
    } catch {
      res.json({ success: true });
    }
  },
};
