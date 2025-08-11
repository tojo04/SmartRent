import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth, requireRole, optionalRefreshContext } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);

// requires access token + populates req.user via requireRole
authRouter.get('/me', requireAuth, requireRole('admin', 'customer'), AuthController.me);

// works even if access token expired (cookie + optionalRefreshContext)
authRouter.post('/refresh', optionalRefreshContext, AuthController.refresh);

// ensure we can still resolve user via refresh context if access token expired
authRouter.post('/logout', optionalRefreshContext, requireAuth, AuthController.logout);

