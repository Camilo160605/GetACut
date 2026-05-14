import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

export interface JwtPayload {
  userId: number;
  role: 'client' | 'barber' | 'admin';
  email: string;
}

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
    res.status(401).json({ success: false, data: null, message: 'Authorization token required' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as JwtPayload;
    next();
  } catch {
    res.status(401).json({ success: false, data: null, message: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: JwtPayload['role'][]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, message: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, data: null, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
