import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const words = sqliteTable('words', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hungarian: text('hungarian').notNull(),
  german: text('german').notNull(),
  gender: text('gender', { enum: ['der', 'die', 'das'] }),
  rating: integer('rating').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  lastPracticedAt: integer('last_practiced_at'),
});

export const practiceSessions = sqliteTable('practice_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  wordId: integer('word_id').notNull().references(() => words.id, { onDelete: 'cascade' }),
  wasCorrect: integer('was_correct', { mode: 'boolean' }).notNull(),
  practicedAt: integer('practiced_at').notNull().default(sql`(unixepoch())`),
});
