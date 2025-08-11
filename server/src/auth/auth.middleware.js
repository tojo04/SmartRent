import jwt from 'jsonwebtoken';
import { config } from '../config/configuration.js';
import { User } from '../users/users.model.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing Authorization header' });

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      if (!req.userId) return res.status(401).json({ message: 'Unauthenticated' });
      const user = await User.findById(req.userId).lean();
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = { id: user._id.toString(), email: user.email, name: user.name, role: user.role };

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (e) {
      res.status(500).json({ message: 'Auth error' });
    }
  };
}

/**
 * Attach userIdFromRefresh if refresh cookie is present & valid.
 * Lets /auth/refresh work even when access token expired.
 */
export function optionalRefreshContext(req, _res, next) {
  try {
    const rtCookie = req.cookies?.[config.cookies.name];
    if (!rtCookie) return next();
    const decoded = jwt.verify(rtCookie, config.jwt.refreshSecret);
    req.userIdFromRefresh = decoded.sub;
  } catch {
    // ignore
  }
  next();
}
