import { and, eq, lt, gt, ne } from 'drizzle-orm';
import { db } from '../db/index';
import { appointments, type Appointment, type NewAppointment } from '../db/schema';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface CreateAppointmentInput {
  clientId: number;
  barberId: number;
  serviceId: number;
  startTime: number; // Unix timestamp (seconds)
  endTime: number;   // Unix timestamp (seconds)
}

export interface AppointmentWithDuration extends Appointment {
  durationMinutes: number;
}

/**
 * Checks whether a barber is available in the given time window.
 * Returns true if the slot is free, false if there is a conflict.
 *
 * Overlap condition: existing.startTime < newEndTime AND existing.endTime > newStartTime
 * (i.e. the intervals intersect)
 */
export const checkAvailability = async (
  barberId: number,
  startTime: number,
  endTime: number,
  excludeAppointmentId?: number
): Promise<boolean> => {
  const conditions = [
    eq(appointments.barberId, barberId),
    // Only active appointments block the slot
    ne(appointments.status, 'cancelled' as AppointmentStatus),
    // Overlap: existing starts before new ends AND existing ends after new starts
    lt(appointments.startTime, endTime),
    gt(appointments.endTime, startTime),
  ];

  if (excludeAppointmentId !== undefined) {
    conditions.push(ne(appointments.id, excludeAppointmentId));
  }

  const conflicts = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(and(...conditions))
    .limit(1);

  return conflicts.length === 0;
};

export const createAppointment = async (
  input: CreateAppointmentInput
): Promise<Appointment> => {
  const available = await checkAvailability(
    input.barberId,
    input.startTime,
    input.endTime
  );

  if (!available) {
    const err = new Error('Time slot is not available for this barber');
    (err as NodeJS.ErrnoException).code = 'SLOT_UNAVAILABLE';
    throw err;
  }

  const newAppointment: NewAppointment = {
    clientId: input.clientId,
    barberId: input.barberId,
    serviceId: input.serviceId,
    startTime: input.startTime,
    endTime: input.endTime,
    status: 'pending',
  };

  const [created] = await db
    .insert(appointments)
    .values(newAppointment)
    .returning();

  if (!created) {
    throw new Error('Failed to create appointment');
  }

  return created;
};

export const getAppointmentsByClient = async (
  clientId: number
): Promise<Appointment[]> => {
  return db
    .select()
    .from(appointments)
    .where(eq(appointments.clientId, clientId))
    .orderBy(appointments.startTime);
};

export const getAppointmentsByBarber = async (
  barberId: number
): Promise<Appointment[]> => {
  return db
    .select()
    .from(appointments)
    .where(eq(appointments.barberId, barberId))
    .orderBy(appointments.startTime);
};

export const getAppointmentById = async (
  id: number
): Promise<Appointment | undefined> => {
  const result = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);
  return result[0];
};

export const updateAppointmentStatus = async (
  id: number,
  status: AppointmentStatus
): Promise<Appointment | undefined> => {
  const existing = await getAppointmentById(id);
  if (!existing) {
    return undefined;
  }

  const [updated] = await db
    .update(appointments)
    .set({ status })
    .where(eq(appointments.id, id))
    .returning();

  return updated;
};
