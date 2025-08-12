import { Router } from 'express';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';
import { ReportsController } from './reports.contoller.js';

export const reportsRouter = Router();

// Test endpoint without auth
reportsRouter.get('/test', (req, res) => {
  res.json({ message: 'Reports API is working!' });
});

// All routes require admin authentication
reportsRouter.use(requireAuth, requireRole('admin'));

// Dashboard stats
reportsRouter.get('/dashboard-stats', ReportsController.getDashboardStats);

// Top categories by revenue and orders
reportsRouter.get('/top-categories', ReportsController.getTopCategories);

// Top products by revenue and orders
reportsRouter.get('/top-products', ReportsController.getTopProducts);

// Top customers by revenue and orders
reportsRouter.get('/top-customers', ReportsController.getTopCustomers);

// Revenue trends over time
reportsRouter.get('/revenue-trends', ReportsController.getRevenueTrends);

// Rental status distribution
reportsRouter.get('/status-stats', ReportsController.getStatusStats);

// Comprehensive analytics report
reportsRouter.get('/analytics', ReportsController.getAnalyticsReport);
