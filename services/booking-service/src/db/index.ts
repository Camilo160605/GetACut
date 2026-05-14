import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import * as schema from './schema';

const DB_PATH = './data/booking.db';

// Ensure the data directory exists before opening the database
mkdirSync(dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Auto-create tables on startup (dev convenience)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id  INTEGER NOT NULL,
    barber_id  INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    start_time INTEGER NOT NULL,
    end_time   INTEGER NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'pending'
                       CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

export const db = drizzle(sqlite, { schema });
