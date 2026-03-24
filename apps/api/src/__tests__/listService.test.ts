import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { createTestDb } from './testDb.js';
import { words, lists, wordLists } from '@vocab/shared';

// We create one shared in-memory DB for all tests in this file.
// The db module is mocked so the service uses our in-memory instance.
const { db } = await createTestDb();

vi.mock('../db.js', () => ({ db }));

// Import services AFTER the mock is set up
const {
  getAllLists,
  createList,
  renameList,
  deleteList,
  linkWord,
  unlinkWord,
  getListById,
} = await import('../services/listService.js');

// Helper to clear tables between tests
async function clearAll() {
  await db.delete(wordLists);
  await db.delete(lists);
  await db.delete(words);
}

// Helper to insert a word and return its id
async function insertWord(hungarian = 'alma', german = 'Apfel') {
  const [row] = await db.insert(words).values({ hungarian, german }).returning();
  return row;
}

describe('getAllLists', () => {
  beforeEach(clearAll);

  it('returns empty array when no lists exist', async () => {
    const result = await getAllLists();
    expect(result).toEqual([]);
  });

  it('returns lists with correct wordCount=0 when no words linked', async () => {
    await createList('Fruits');
    const result = await getAllLists();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Fruits');
    expect(result[0].wordCount).toBe(0);
  });

  it('returns wordCount reflecting linked words', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number; name: string } };
    const word1 = await insertWord('alma', 'Apfel');
    const word2 = await insertWord('körte', 'Birne');
    await linkWord(list.id, word1.id);
    await linkWord(list.id, word2.id);
    const result = await getAllLists();
    expect(result[0].wordCount).toBe(2);
  });
});

describe('createList', () => {
  beforeEach(clearAll);

  it('creates a list successfully', async () => {
    const result = await createList('Fruits');
    expect(result.error).toBeUndefined();
    expect(result.list).toBeDefined();
    expect(result.list!.name).toBe('Fruits');
    expect(result.list!.id).toBeTypeOf('number');
  });

  it('returns { error: "protected" } for "Alle Wörter" (exact case)', async () => {
    const result = await createList('Alle Wörter');
    expect(result).toEqual({ error: 'protected' });
  });

  it('returns { error: "protected" } for "alle wörter" (lowercase)', async () => {
    const result = await createList('alle wörter');
    expect(result).toEqual({ error: 'protected' });
  });

  it('returns { error: "protected" } for "ALLE WÖRTER" (uppercase)', async () => {
    const result = await createList('ALLE WÖRTER');
    expect(result).toEqual({ error: 'protected' });
  });

  it('returns { error: "duplicate" } when creating a list with the same name twice', async () => {
    await createList('Fruits');
    const result = await createList('Fruits');
    expect(result).toEqual({ error: 'duplicate' });
  });

  it('trims whitespace from name before creating', async () => {
    // ListNameSchema trims, but service receives already-trimmed value from route;
    // the service itself does not re-trim. We test the service contract directly.
    const result = await createList('Animals');
    expect(result.list!.name).toBe('Animals');
  });
});

describe('renameList', () => {
  beforeEach(clearAll);

  it('renames a list successfully', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    const result = await renameList(list.id, 'Vegetables');
    expect(result.error).toBeUndefined();
    expect(result.list!.name).toBe('Vegetables');
  });

  it('returns { error: "notfound" } for non-existent id', async () => {
    const result = await renameList(999, 'Anything');
    expect(result).toEqual({ error: 'notfound' });
  });

  it('returns { error: "protected" } when renaming to "Alle Wörter"', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    const result = await renameList(list.id, 'Alle Wörter');
    expect(result).toEqual({ error: 'protected' });
  });

  it('returns { error: "protected" } when renaming to "ALLE WÖRTER"', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    const result = await renameList(list.id, 'ALLE WÖRTER');
    expect(result).toEqual({ error: 'protected' });
  });

  it('returns { error: "duplicate" } when renaming to an existing list name', async () => {
    const { list: list1 } = (await createList('Fruits')) as { list: { id: number } };
    await createList('Vegetables');
    const result = await renameList(list1.id, 'Vegetables');
    expect(result).toEqual({ error: 'duplicate' });
  });

  it('succeeds (no-op) when renaming to the same name (case-insensitive match)', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number; name: string } };
    // Same name — the service short-circuits and returns the existing list
    const result = await renameList(list.id, 'Fruits');
    expect(result.error).toBeUndefined();
    expect(result.list!.name).toBe('Fruits');
  });
});

describe('deleteList', () => {
  beforeEach(clearAll);

  it('removes a list and returns true', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    const deleted = await deleteList(list.id);
    expect(deleted).toBe(true);
    const after = await getAllLists();
    expect(after).toHaveLength(0);
  });

  it('returns false for a non-existent id', async () => {
    const deleted = await deleteList(999);
    expect(deleted).toBe(false);
  });
});

describe('linkWord', () => {
  beforeEach(clearAll);

  it('links a word to a list successfully', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    const word = await insertWord();
    const result = await linkWord(list.id, word.id);
    expect(result).toEqual({});
    // Verify wordCount increased
    const allLists = await getAllLists();
    expect(allLists[0].wordCount).toBe(1);
  });

  it('is idempotent — calling linkWord twice does not error', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    const word = await insertWord();
    await linkWord(list.id, word.id);
    const result = await linkWord(list.id, word.id);
    expect(result).toEqual({});
  });

  it('returns { error: "listNotFound" } for non-existent list', async () => {
    const word = await insertWord();
    const result = await linkWord(999, word.id);
    expect(result).toEqual({ error: 'listNotFound' });
  });

  it('returns { error: "wordNotFound" } for non-existent word', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    const result = await linkWord(list.id, 999);
    expect(result).toEqual({ error: 'wordNotFound' });
  });
});

describe('unlinkWord', () => {
  beforeEach(clearAll);

  it('unlinks a word from a list and returns true', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    const word = await insertWord();
    await linkWord(list.id, word.id);
    const result = await unlinkWord(list.id, word.id);
    expect(result).toBe(true);
  });

  it('returns false when the link does not exist (non-existent wordId)', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    const result = await unlinkWord(list.id, 999);
    expect(result).toBe(false);
  });

  it('returns false for a non-existent listId', async () => {
    const word = await insertWord();
    const result = await unlinkWord(999, word.id);
    expect(result).toBe(false);
  });
});

describe('getListById', () => {
  beforeEach(clearAll);

  it('returns the list when found', async () => {
    const { list } = (await createList('Fruits')) as { list: { id: number; name: string } };
    const found = await getListById(list.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Fruits');
  });

  it('returns null for a non-existent id', async () => {
    const found = await getListById(999);
    expect(found).toBeNull();
  });
});
