import { Router } from 'express';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';
import { ProductsController } from './products.controller.js';

export const productsRouter = Router();

// Public reads (storefront)
productsRouter.get('/', ProductsController.list);
productsRouter.get('/:id', ProductsController.getOne);

// Admin writes
productsRouter.post('/', requireAuth, requireRole('admin'), ProductsController.create);
productsRouter.patch('/:id', requireAuth, requireRole('admin'), ProductsController.update);
productsRouter.delete('/:id', requireAuth, requireRole('admin'), ProductsController.remove);
