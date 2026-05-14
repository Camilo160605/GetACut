import { Router } from 'express';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth-middleware';
import { getDailyReportHandler } from '../controllers/report-controller';

export const reportRouter = Router();

// Only admins can access reports
reportRouter.get(
  '/daily',
  verifyTokenMiddleware,
  requireRole('admin'),
  getDailyReportHandler
);
