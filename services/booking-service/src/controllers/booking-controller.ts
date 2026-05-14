import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import axios from 'axios';
import type { AuthenticatedRequest } from '../middlewares/auth-middleware';
import {
  createAppointment,
  getAppointmentsByClient,
  getAppointmentsByBarber,
  getAppointmentById,
  updateAppointmentStatus,
  type AppointmentStatus,
} from '../services/booking-service';

const CATALOG_SERVICE_URL =
  process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3004';

// ISO 8601 datetime string → Unix timestamp (seconds)
const isoToUnix = (iso: string): number => Math.floor(new Date(iso).getTime() / 1000);

interface CatalogServiceResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    durationMinutes: number;
    price: number;
    description: string | null;
  } | null;
  message: string | null;
}

/**
 * Fetches the service from catalog-service and returns its durationMinutes.
 * Throws with a descriptive message if the service is not found or the call fails.
 */
const fetchServiceDuration = async (
  serviceId: number,
  authHeader: string
): Promise<number> => {
  const url = `${CATALOG_SERVICE_URL}/catalog/services/${serviceId}`;
  const response = await axios.get<CatalogServiceResponse>(url, {
    headers: { Authorization: authHeader },
    timeout: 5000,
  });

  const { data } = response.data;
  if (!data) {
    const err = new Error(`Service ${serviceId} not found in catalog`);
    (err as NodeJS.ErrnoException).code = 'SERVICE_NOT_FOUND';
    throw err;
  }

  return data.durationMinutes;
};

const createAppointmentSchema = z.object({
  barberId: z.number().int().positive('barberId must be a positive integer'),
  serviceId: z.number().int().positive('serviceId must be a positive integer'),
  // Accept ISO 8601 string; endTime is calculated automatically from service duration
  startTime: z.string().datetime({ message: 'startTime must be a valid ISO 8601 datetime' }),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'status must be one of: pending, confirmed, completed, cancelled' }),
  }),
});

export const createAppointmentHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = createAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const clientId = req.user!.userId;
    const { barberId, serviceId, startTime } = parsed.data;

    // Fetch service duration from catalog-service
    const authHeader = req.headers.authorization ?? '';
    let durationMinutes: number;
    try {
      durationMinutes = await fetchServiceDuration(serviceId, authHeader);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'SERVICE_NOT_FOUND') {
        res.status(404).json({ success: false, data: null, message: error.message });
        return;
      }
      // catalog-service unreachable or returned an error
      res.status(502).json({
        success: false,
        data: null,
        message: 'Could not reach catalog-service to validate the service',
      });
      return;
    }

    const startUnix = isoToUnix(startTime);
    const endUnix = startUnix + durationMinutes * 60; // durationMinutes → seconds

    const appointment = await createAppointment({
      clientId,
      barberId,
      serviceId,
      startTime: startUnix,
      endTime: endUnix,
    });

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created',
    });
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'SLOT_UNAVAILABLE') {
      res.status(409).json({
        success: false,
        data: null,
        message: error.message,
      });
      return;
    }
    next(err);
  }
};

export const getMyAppointmentsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientId = req.user!.userId;
    const data = await getAppointmentsByClient(clientId);
    res.status(200).json({ success: true, data, message: null });
  } catch (err) {
    next(err);
  }
};

export const getBarberAppointmentsHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const barberId = parseInt(req.params['id'] ?? '', 10);
    if (isNaN(barberId)) {
      res.status(400).json({ success: false, data: null, message: 'Invalid barber ID' });
      return;
    }

    const data = await getAppointmentsByBarber(barberId);
    res.status(200).json({ success: true, data, message: null });
  } catch (err) {
    next(err);
  }
};

export const updateAppointmentStatusHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params['id'] ?? '', 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, data: null, message: 'Invalid appointment ID' });
      return;
    }

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: null,
        message: parsed.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    // Only barber or admin can change status
    const userRole = req.user!.role;
    if (userRole !== 'barber' && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        data: null,
        message: 'Only barbers and admins can update appointment status',
      });
      return;
    }

    const existing = await getAppointmentById(id);
    if (!existing) {
      res.status(404).json({ success: false, data: null, message: 'Appointment not found' });
      return;
    }

    const updated = await updateAppointmentStatus(id, parsed.data.status as AppointmentStatus);
    res.status(200).json({ success: true, data: updated, message: 'Status updated' });
  } catch (err) {
    next(err);
  }
};
