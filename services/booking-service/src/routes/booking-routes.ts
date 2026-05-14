import { Router } from 'express';
import { verifyTokenMiddleware } from '../middlewares/auth-middleware';
import {
  createAppointmentHandler,
  getMyAppointmentsHandler,
  getBarberAppointmentsHandler,
  updateAppointmentStatusHandler,
} from '../controllers/booking-controller';

export const bookingRouter = Router();

// All routes require a valid JWT
bookingRouter.post('/', verifyTokenMiddleware, createAppointmentHandler);
bookingRouter.get('/me', verifyTokenMiddleware, getMyAppointmentsHandler);
bookingRouter.get('/barber/:id', verifyTokenMiddleware, getBarberAppointmentsHandler);
bookingRouter.put('/:id/status', verifyTokenMiddleware, updateAppointmentStatusHandler);
