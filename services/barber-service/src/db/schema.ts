import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const barbers = sqliteTable('barbers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // userId references the user in auth-service (no FK across services)
  userId: integer('user_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  bio: text('bio'),
  // Percentage of each service price the barber earns (overrides global default)
  earningsPercentage: real('earnings_percentage').notNull().default(40),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Barber = typeof barbers.$inferSelect;
export type NewBarber = typeof barbers.$inferInsert;
