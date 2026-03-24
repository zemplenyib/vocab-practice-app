import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
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

export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});

export const wordLists = sqliteTable('word_lists', {
  wordId: integer('word_id').notNull().references(() => words.id, { onDelete: 'cascade' }),
  listId: integer('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.wordId, table.listId] }),
}));
