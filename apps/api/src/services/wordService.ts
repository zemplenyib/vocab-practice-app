import { db } from '../db.js';
import { words } from '@vocab/shared';
import type { AddWordInput, WordWithCategory } from '@vocab/shared';
import { getCategory } from '@vocab/shared';
import { eq, desc } from 'drizzle-orm';

export async function getAllWords(): Promise<WordWithCategory[]> {
  const rows = await db.select().from(words).orderBy(desc(words.createdAt));
  return rows.map(w => ({ ...w, category: getCategory(w.rating) }));
}

export async function addWord(input: AddWordInput): Promise<WordWithCategory> {
  const [row] = await db
    .insert(words)
    .values({
      hungarian: input.hungarian,
      german: input.german,
      gender: input.gender ?? null,
    })
    .returning();
  return { ...row, category: getCategory(row.rating) };
}

export async function getWordById(id: number) {
  const [row] = await db.select().from(words).where(eq(words.id, id));
  return row ?? null;
}

export async function updateWordRating(id: number, rating: number) {
  await db.update(words).set({ rating, lastPracticedAt: Math.floor(Date.now() / 1000) }).where(eq(words.id, id));
}

export async function updateWord(id: number, input: AddWordInput): Promise<WordWithCategory | null> {
  await db
    .update(words)
    .set({ hungarian: input.hungarian, german: input.german, gender: input.gender ?? null })
    .where(eq(words.id, id));
  return getWordById(id).then(row => row ? { ...row, category: getCategory(row.rating) } : null);
}
