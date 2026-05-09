import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { registerClient, loginUser } from '../services/auth-service';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { name, email, password } = parsed.data;
    const result = await registerClient(name, email, password);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful',
    });
  } catch (err) {
    next(err);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { email, password } = parsed.data;
    const result = await loginUser(email, password);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (err) {
    // Avoid leaking whether the email exists
    if (err instanceof Error && err.message === 'Invalid credentials') {
      res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password',
      });
      return;
    }
    next(err);
  }
};
