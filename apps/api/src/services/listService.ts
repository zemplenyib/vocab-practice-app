import { db } from '../db.js';
import { lists, wordLists, words } from '@vocab/shared';
import { eq, sql, and } from 'drizzle-orm';
import type { List, ListWithCount } from '@vocab/shared';

const ALLE_WOERTER = 'alle wörter';

function isProtectedName(name: string): boolean {
  return name.toLowerCase() === ALLE_WOERTER;
}

export async function getAllLists(): Promise<ListWithCount[]> {
  const rows = await db
    .select({
      id: lists.id,
      name: lists.name,
      createdAt: lists.createdAt,
      wordCount: sql<number>`count(${wordLists.wordId})`.as('word_count'),
    })
    .from(lists)
    .leftJoin(wordLists, eq(lists.id, wordLists.listId))
    .groupBy(lists.id)
    .orderBy(lists.createdAt);
  return rows;
}

export async function getListById(id: number): Promise<List | null> {
  const [row] = await db.select().from(lists).where(eq(lists.id, id));
  return row ?? null;
}

export async function getListByIdWithCount(id: number): Promise<ListWithCount | null> {
  const [row] = await db
    .select({
      id: lists.id,
      name: lists.name,
      createdAt: lists.createdAt,
      wordCount: sql<number>`count(${wordLists.wordId})`.as('word_count'),
    })
    .from(lists)
    .leftJoin(wordLists, eq(wordLists.listId, lists.id))
    .where(eq(lists.id, id))
    .groupBy(lists.id);
  return row ?? null;
}

export async function createList(name: string): Promise<{ list?: List; error?: 'protected' | 'duplicate' }> {
  if (isProtectedName(name)) return { error: 'protected' };
  try {
    const [row] = await db.insert(lists).values({ name }).returning();
    return { list: row };
  } catch (e: any) {
    if (e?.message?.includes('UNIQUE constraint')) return { error: 'duplicate' };
    throw e;
  }
}

export async function renameList(id: number, name: string): Promise<{ list?: List; error?: 'protected' | 'duplicate' | 'notfound' }> {
  if (isProtectedName(name)) return { error: 'protected' };
  const existing = await getListById(id);
  if (!existing) return { error: 'notfound' };
  if (existing.name.toLowerCase() === name.toLowerCase()) return { list: existing };
  try {
    const [row] = await db.update(lists).set({ name }).where(eq(lists.id, id)).returning();
    return { list: row };
  } catch (e: any) {
    if (e?.message?.includes('UNIQUE constraint')) return { error: 'duplicate' };
    throw e;
  }
}

export async function deleteList(id: number): Promise<boolean> {
  const result = await db.delete(lists).where(eq(lists.id, id)).returning();
  return result.length > 0;
}

export async function linkWord(listId: number, wordId: number): Promise<{ error?: 'listNotFound' | 'wordNotFound' }> {
  const list = await getListById(listId);
  if (!list) return { error: 'listNotFound' };
  const [word] = await db.select().from(words).where(eq(words.id, wordId));
  if (!word) return { error: 'wordNotFound' };
  await db.insert(wordLists).values({ wordId, listId }).onConflictDoNothing();
  return {};
}

export async function unlinkWord(listId: number, wordId: number): Promise<boolean> {
  const result = await db.delete(wordLists)
    .where(and(eq(wordLists.listId, listId), eq(wordLists.wordId, wordId)))
    .returning();
  return result.length > 0;
}
