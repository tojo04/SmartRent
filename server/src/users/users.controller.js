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

// Admin can delete/remove customers (not other admins)
usersRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    // Find the user to be deleted
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting admin users (safety measure)
    if (userToDelete.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    // Prevent self-deletion
    if (userToDelete._id.toString() === currentUser.id) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    console.log(`🗑️ User deleted by admin: ${userToDelete.email} (deleted by ${currentUser.email})`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`❌ User deletion failed:`, error.message);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});