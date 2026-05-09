import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error('[Error]', err.message, err.stack);

  // Determine HTTP status code
  let statusCode = err.statusCode ?? 500;

  // Map known error codes to HTTP statuses
  if (err.code === 'DUPLICATE_EMAIL') {
    statusCode = 409;
  }

  // Zod validation errors come through as 400
  if (err.name === 'ZodError') {
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
  }

  const message =
    statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
  });
};
