import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { barbers, type Barber, type NewBarber } from '../db/schema';

export interface CreateBarberInput {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  earningsPercentage?: number;
}

export interface UpdateBarberInput {
  name?: string;
  phone?: string;
  bio?: string;
  earningsPercentage?: number;
  isActive?: boolean;
}

export const getAllBarbers = async (): Promise<Barber[]> => {
  return db
    .select()
    .from(barbers)
    .where(eq(barbers.isActive, true))
    .orderBy(barbers.name);
};

export const getBarberById = async (id: number): Promise<Barber | undefined> => {
  const result = await db
    .select()
    .from(barbers)
    .where(eq(barbers.id, id))
    .limit(1);
  return result[0];
};

export const getBarberByUserId = async (userId: number): Promise<Barber | undefined> => {
  const result = await db
    .select()
    .from(barbers)
    .where(eq(barbers.userId, userId))
    .limit(1);
  return result[0];
};

export const createBarberProfile = async (input: CreateBarberInput): Promise<Barber> => {
  const newBarber: NewBarber = {
    userId: input.userId,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    bio: input.bio ?? null,
    earningsPercentage: input.earningsPercentage ?? 40,
    isActive: true,
  };

  const [created] = await db.insert(barbers).values(newBarber).returning();

  if (!created) {
    throw new Error('Failed to create barber profile');
  }

  return created;
};

export const updateBarberProfile = async (
  id: number,
  input: UpdateBarberInput
): Promise<Barber | undefined> => {
  const existing = await getBarberById(id);
  if (!existing) return undefined;

  const [updated] = await db
    .update(barbers)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.earningsPercentage !== undefined && {
        earningsPercentage: input.earningsPercentage,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    })
    .where(eq(barbers.id, id))
    .returning();

  return updated;
};
