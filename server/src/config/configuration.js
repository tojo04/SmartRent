// server/src/config/configuration.js
import 'dotenv/config';

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtlSec: 60 * 15,          // 15 minutes
    refreshTtlSec: 60 * 60 * 24 * 7 // 7 days
  },
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
  },
  cookies: {
    name: process.env.COOKIE_NAME || 'rt',
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE || 'lax'),
  }
};
