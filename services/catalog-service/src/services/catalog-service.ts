import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { services, type Service, type NewService } from '../db/schema';

export interface CreateServiceInput {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
}

export const getAllServices = async (): Promise<Service[]> => {
  return db.select().from(services).orderBy(services.name);
};

export const getServiceById = async (id: number): Promise<Service | undefined> => {
  const result = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  return result[0];
};

export const createService = async (input: CreateServiceInput): Promise<Service> => {
  const newService: NewService = {
    name: input.name,
    description: input.description ?? null,
    price: input.price,
    durationMinutes: input.durationMinutes,
  };

  const [created] = await db.insert(services).values(newService).returning();

  if (!created) {
    throw new Error('Failed to create service');
  }

  return created;
};

export const updateService = async (
  id: number,
  input: UpdateServiceInput
): Promise<Service | undefined> => {
  const existing = await getServiceById(id);
  if (!existing) {
    return undefined;
  }

  const [updated] = await db
    .update(services)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
    })
    .where(eq(services.id, id))
    .returning();

  return updated;
};

export const deleteService = async (id: number): Promise<boolean> => {
  const existing = await getServiceById(id);
  if (!existing) {
    return false;
  }

  await db.delete(services).where(eq(services.id, id));
  return true;
};
