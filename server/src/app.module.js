import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { config } from './config/configuration.js';
import { authRouter } from './auth/auth.module.js';
import { usersRouter } from './users/users.controller.js';

export async function createApp() {
  await mongoose.connect(config.mongoUri);

  const app = express();
  app.use(cors({ origin: config.cors.origin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Basic rate limit for auth endpoints
  const limiter = rateLimit({ windowMs: 60_000, max: 60 });
  app.use('/auth', limiter);

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);

  return app;
}
