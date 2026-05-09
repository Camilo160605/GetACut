import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { createBarber } from '../services/auth-service';
import type { AuthenticatedRequest } from '../middlewares/auth-middleware';

const createBarberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});

export const createBarberHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createBarberSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { name, email, password } = parsed.data;
    const result = await createBarber(name, email, password);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Barber created successfully',
    });
  } catch (err) {
    next(err);
  }
};
