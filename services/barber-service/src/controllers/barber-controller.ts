import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middlewares/auth-middleware';
import {
  getAllBarbers,
  getBarberById,
  createBarberProfile,
  updateBarberProfile,
} from '../services/barber-service';

const createBarberSchema = z.object({
  userId: z.number().int().positive('userId must be a positive integer'),
  name: z.string().min(1, 'name is required'),
  email: z.string().email('invalid email'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  earningsPercentage: z.number().min(0).max(100).optional(),
});

const updateBarberSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  earningsPercentage: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export const listBarbersHandler = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAllBarbers();
    res.status(200).json({ success: true, data, message: null });
  } catch (err) {
    next(err);
  }
};

export const getBarberHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] ?? '', 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, data: null, message: 'Invalid barber ID' });
      return;
    }
    const barber = await getBarberById(id);
    if (!barber) {
      res.status(404).json({ success: false, data: null, message: 'Barber not found' });
      return;
    }
    res.status(200).json({ success: true, data: barber, message: null });
  } catch (err) {
    next(err);
  }
};

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
    const barber = await createBarberProfile(parsed.data);
    res.status(201).json({ success: true, data: barber, message: 'Barber profile created' });
  } catch (err) {
    next(err);
  }
};

export const updateBarberHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] ?? '', 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, data: null, message: 'Invalid barber ID' });
      return;
    }
    const parsed = updateBarberSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }
    const updated = await updateBarberProfile(id, parsed.data);
    if (!updated) {
      res.status(404).json({ success: false, data: null, message: 'Barber not found' });
      return;
    }
    res.status(200).json({ success: true, data: updated, message: 'Barber profile updated' });
  } catch (err) {
    next(err);
  }
};
