import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../users/users.model.js';
import { config } from '../config/configuration.js';

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtlSec });
}
function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtlSec });
}

export const AuthService = {
  async register({ name, email, password }) {
    const exists = await User.findOne({ email });
    if (exists) throw new Error('Email already in use');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const tokens = await this._issueTokens(user);
    return { user: this._publicUser(user), ...tokens };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid email or password');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid email or password');
    const tokens = await this._issueTokens(user);
    return { user: this._publicUser(user), ...tokens };
  },

  async refresh(userId, refreshToken) {
    if (!userId) throw new Error('Invalid refresh token');
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      if (decoded.sub !== userId) throw new Error('Invalid refresh token');
    } catch {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
      throw new Error('Refresh token mismatch');
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const newRefreshToken = signRefreshToken({ sub: user.id });

    user.refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId) {
    if (!userId) return;
    const user = await User.findById(userId);
    if (!user) return;
    user.refreshTokenHash = null;
    await user.save();
  },

  _publicUser(user) {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },

  async _issueTokens(user) {
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    user.refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();
    return { accessToken, refreshToken };
  }
};

