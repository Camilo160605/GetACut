import { Router } from 'express';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth-middleware';
import {
  listBarbersHandler,
  getBarberHandler,
  createBarberHandler,
  updateBarberHandler,
} from '../controllers/barber-controller';

export const barberRouter = Router();

// Any authenticated user can list/view barbers
barberRouter.get('/', verifyTokenMiddleware, listBarbersHandler);
barberRouter.get('/:id', verifyTokenMiddleware, getBarberHandler);

// Admin only — create and update barber profiles
barberRouter.post('/', verifyTokenMiddleware, requireRole('admin'), createBarberHandler);
barberRouter.put('/:id', verifyTokenMiddleware, requireRole('admin'), updateBarberHandler);
