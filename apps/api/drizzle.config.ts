import type { Config } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL ?? 'file:./vocab.db';
const url = dbUrl.startsWith('file:') ? dbUrl : `file:${dbUrl}`;

export default {
  schema: '../../packages/shared/src/schema.ts',
  out: './src/migrations',
  dialect: 'sqlite',
  dbCredentials: { url },
} satisfies Config;
