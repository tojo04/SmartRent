import { Router } from 'express';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';
import { RentalsController } from './rentals.controller.js';

export const rentalsRouter = Router();

// Customer routes (requires authentication)
rentalsRouter.post('/', requireAuth, requireRole('customer', 'admin'), RentalsController.create);
rentalsRouter.get('/my-rentals', requireAuth, requireRole('customer', 'admin'), RentalsController.getMyRentals);
rentalsRouter.get('/active', requireAuth, requireRole('customer', 'admin'), RentalsController.getActiveRental);

// General routes (customers see their own, admins see all)
rentalsRouter.get('/', requireAuth, requireRole('customer', 'admin'), RentalsController.list);
rentalsRouter.get('/:id', requireAuth, requireRole('customer', 'admin'), RentalsController.getOne);

// Admin only routes
rentalsRouter.patch('/:id/status', requireAuth, requireRole('admin'), RentalsController.updateStatus);
