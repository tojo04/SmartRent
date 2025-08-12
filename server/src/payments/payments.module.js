import { Router } from 'express';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';
import { PaymentsController } from './payments.controller.js';

export const paymentsRouter = Router();

paymentsRouter.post('/razorpay/order', requireAuth, requireRole('customer', 'admin'), PaymentsController.createRazorpayOrder);
