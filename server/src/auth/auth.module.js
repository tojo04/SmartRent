import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth, requireRole, optionalRefreshContext } from './auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/login-admin', AuthController.loginAdmin); // NEW

// OTP routes
authRouter.post('/verify-email', AuthController.verifyEmail);
authRouter.post('/resend-otp', AuthController.resendOTP);
authRouter.post('/request-password-reset', AuthController.requestPasswordReset);
authRouter.post('/reset-password', AuthController.resetPassword);

authRouter.get('/me', requireAuth, requireRole('admin', 'customer'), AuthController.me);

authRouter.post('/refresh', optionalRefreshContext, AuthController.refresh);

authRouter.post('/logout', optionalRefreshContext, requireAuth, AuthController.logout);

