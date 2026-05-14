import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middlewares/auth-middleware';
import { buildDailyReport } from '../services/report-service';

// YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const dailyReportQuerySchema = z.object({
  date: z
    .string({ required_error: 'date query param is required (YYYY-MM-DD)' })
    .regex(DATE_REGEX, 'date must be in YYYY-MM-DD format'),
  // Optional comma-separated list of barber IDs: ?barberIds=1,2,3
  barberIds: z.string().optional(),
});

export const getDailyReportHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = dailyReportQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { date, barberIds: barberIdsRaw } = parsed.data;

    // Parse optional barberIds: "1,2,3" → [1, 2, 3]
    let barberIds: number[] | undefined;
    if (barberIdsRaw) {
      const parsed = barberIdsRaw
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0);
      barberIds = parsed.length > 0 ? parsed : undefined;
    }

    const authHeader = req.headers.authorization ?? '';
    const report = await buildDailyReport(date, authHeader, barberIds);

    res.status(200).json({
      success: true,
      data: report,
      message: null,
    });
  } catch (err) {
    next(err);
  }
};
