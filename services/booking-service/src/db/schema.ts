import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientId: integer('client_id').notNull(),
  barberId: integer('barber_id').notNull(),
  serviceId: integer('service_id').notNull(),
  // Stored as Unix timestamps (seconds)
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  status: text('status', {
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
