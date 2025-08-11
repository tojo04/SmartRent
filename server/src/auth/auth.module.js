import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth, requireRole, optionalRefreshContext } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login',    AuthController.login);

// Current user (requires access token)
authRouter.get('/me', requireAuth, requireRole('admin','customer'), AuthController.me);

// Refresh (no access token needed, uses refresh cookie)
authRouter.post('/refresh', optionalRefreshContext, AuthController.refresh);

// Logout (clears cookie, invalidates refresh server-side if possible)
authRouter.post('/logout', requireAuth, AuthController.logout);
