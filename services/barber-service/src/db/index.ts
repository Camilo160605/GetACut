import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import * as schema from './schema';

const DB_PATH = './data/barber.db';

mkdirSync(dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS barbers (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id              INTEGER NOT NULL UNIQUE,
    name                 TEXT    NOT NULL,
    email                TEXT    NOT NULL UNIQUE,
    phone                TEXT,
    bio                  TEXT,
    earnings_percentage  REAL    NOT NULL DEFAULT 40,
    is_active            INTEGER NOT NULL DEFAULT 1,
    created_at           INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

export const db = drizzle(sqlite, { schema });
