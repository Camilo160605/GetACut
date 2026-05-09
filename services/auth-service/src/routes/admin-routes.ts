import { Router } from 'express';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth-middleware';
import { createBarberHandler } from '../controllers/admin-controller';

export const adminRouter = Router();

// POST /admin/barbers — protected: admin only
adminRouter.post(
  '/barbers',
  verifyTokenMiddleware,
  requireRole('admin'),
  createBarberHandler
);
