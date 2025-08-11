import { Router } from 'express';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';

export const usersRouter = Router();

// Example: admin-only list
usersRouter.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  res.json({ ok: true, message: `Hello admin ${req.user?.name || ''}` });
});
