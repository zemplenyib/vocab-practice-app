import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '@vocab/shared';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbUrl = process.env.DATABASE_URL ?? 'file:./vocab.db';

// Ensure file: prefix for local SQLite
const url = dbUrl.startsWith('file:') ? dbUrl : `file:${dbUrl}`;

const client = createClient({ url });
export const db = drizzle(client, { schema });

// Run migrations on startup
const migrationsFolder = join(__dirname, 'migrations');
await migrate(db, { migrationsFolder });
