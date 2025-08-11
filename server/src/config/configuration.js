// server/src/config/configuration.js
import 'dotenv/config';

const buildCorsOrigin = () => {
  const envOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
    : [];

  // In development, automatically allow common Vite ports
  if ((process.env.NODE_ENV || 'development') !== 'production') {
    const devOrigins = ['http://localhost:5173', 'http://localhost:5174'];
    for (const origin of devOrigins) {
      if (!envOrigins.includes(origin)) envOrigins.push(origin);
    }
  }

  return envOrigins.length > 0 ? envOrigins : true; // reflect request origin if none provided
};

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
    // Accept env-provided origins, plus common localhost dev ports when not in production.
    origin: buildCorsOrigin(),
    credentials: true,
  },
  cookies: {
    name: process.env.COOKIE_NAME || 'rt',
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE || 'lax'),
  }
};
