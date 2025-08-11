import { Router } from 'express';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';
import { User } from './users.model.js';

export const usersRouter = Router();

// Example admin-only list endpoint
usersRouter.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const users = await User.find().select('_id email name role').lean();
  res.json({ users });
});

// Admin can change a user's role
usersRouter.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'customer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json({ user: { id: u.id, email: u.email, name: u.name, role: u.role } });
});
