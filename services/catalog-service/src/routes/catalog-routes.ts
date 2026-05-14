import { Router } from 'express';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth-middleware';
import {
  listServicesHandler,
  getServiceHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from '../controllers/catalog-controller';

export const catalogRouter = Router();

// Public (authenticated) — any valid JWT
catalogRouter.get('/', verifyTokenMiddleware, listServicesHandler);
catalogRouter.get('/:id', verifyTokenMiddleware, getServiceHandler);

// Admin only
catalogRouter.post('/', verifyTokenMiddleware, requireRole('admin'), createServiceHandler);
catalogRouter.put('/:id', verifyTokenMiddleware, requireRole('admin'), updateServiceHandler);
catalogRouter.delete('/:id', verifyTokenMiddleware, requireRole('admin'), deleteServiceHandler);
