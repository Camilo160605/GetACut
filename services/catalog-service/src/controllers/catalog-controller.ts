import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middlewares/auth-middleware';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../services/catalog-service';

const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  durationMinutes: z
    .number()
    .int('Duration must be an integer')
    .positive('Duration must be positive'),
});

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  durationMinutes: z.number().int().positive().optional(),
});

export const listServicesHandler = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAllServices();
    res.status(200).json({ success: true, data, message: null });
  } catch (err) {
    next(err);
  }
};

export const getServiceHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] ?? '', 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, data: null, message: 'Invalid service ID' });
      return;
    }

    const service = await getServiceById(id);
    if (!service) {
      res.status(404).json({ success: false, data: null, message: 'Service not found' });
      return;
    }

    res.status(200).json({ success: true, data: service, message: null });
  } catch (err) {
    next(err);
  }
};

export const createServiceHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const service = await createService(parsed.data);
    res.status(201).json({ success: true, data: service, message: 'Service created' });
  } catch (err) {
    next(err);
  }
};

export const updateServiceHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] ?? '', 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, data: null, message: 'Invalid service ID' });
      return;
    }

    const parsed = updateServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const updated = await updateService(id, parsed.data);
    if (!updated) {
      res.status(404).json({ success: false, data: null, message: 'Service not found' });
      return;
    }

    res.status(200).json({ success: true, data: updated, message: 'Service updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteServiceHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] ?? '', 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, data: null, message: 'Invalid service ID' });
      return;
    }

    const deleted = await deleteService(id);
    if (!deleted) {
      res.status(404).json({ success: false, data: null, message: 'Service not found' });
      return;
    }

    res.status(200).json({ success: true, data: null, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};
