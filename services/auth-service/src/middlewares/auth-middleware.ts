import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../services/auth-service';

// Extend Express Request to carry the authenticated user payload
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const verifyTokenMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      data: null,
      message: 'Authorization token required',
    });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired token',
    });
  }
};

export const requireRole = (...roles: JwtPayload['role'][]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        data: null,
        message: 'Not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        data: null,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};
