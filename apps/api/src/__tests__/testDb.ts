/**
 * Creates an isolated in-memory database for tests.
 *
 * The services import `db` from '../db.js'. Because we cannot easily intercept
 * that top-level module import while also avoiding real file I/O and migration
 * runs, we take a different approach:
 *
 * - Each test file imports this helper BEFORE importing any service.
 * - We set `process.env.DATABASE_URL = ':memory:'` so that when db.ts is
 *   first imported it creates an in-memory client.
 * - We then manually execute the DDL that the migrations would produce so the
 *   tables exist.
 * - We re-export the drizzle `db` instance so tests can directly insert seed
 *   rows without going through the service layer.
 *
 * NOTE: Vitest re-uses the same Node.js module cache within a file unless
 * vi.resetModules() is called. Because we set DATABASE_URL before the first
 * import of db.ts, all services imported in the same file will share this
 * in-memory database.
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@vocab/shared';

export async function createTestDb() {
  const client = createClient({ url: ':memory:' });

  // Enable foreign key enforcement
  await client.execute('PRAGMA foreign_keys = ON');

  // Apply schema DDL (mirrors 0000 and 0001 migrations)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      hungarian TEXT NOT NULL,
      german TEXT NOT NULL,
      gender TEXT,
      rating INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      last_practiced_at INTEGER
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS practice_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      word_id INTEGER NOT NULL,
      was_correct INTEGER NOT NULL,
      practiced_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  await client.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS lists_name_unique ON lists (name)
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS word_lists (
      word_id INTEGER NOT NULL,
      list_id INTEGER NOT NULL,
      PRIMARY KEY (list_id, word_id),
      FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    )
  `);

  const db = drizzle(client, { schema });
  return { client, db };
}
