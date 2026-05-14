import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[catalog-service] Error:', err.message);

  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal server error';

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
  });
};
