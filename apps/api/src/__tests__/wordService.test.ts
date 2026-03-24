import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb } from './testDb.js';
import { words, lists, wordLists } from '@vocab/shared';

const { db } = await createTestDb();

vi.mock('../db.js', () => ({ db }));

const {
  deleteWord,
  getWordsByListId,
  getAllWords,
  addWord,
  getWordById,
} = await import('../services/wordService.js');

const { createList, linkWord } = await import('../services/listService.js');

async function clearAll() {
  await db.delete(wordLists);
  await db.delete(lists);
  await db.delete(words);
}

async function insertWord(hungarian = 'alma', german = 'Apfel') {
  const [row] = await db.insert(words).values({ hungarian, german }).returning();
  return row;
}

describe('deleteWord', () => {
  beforeEach(clearAll);

  it('removes a word and returns true', async () => {
    const word = await insertWord();
    const result = await deleteWord(word.id);
    expect(result).toBe(true);
    const found = await getWordById(word.id);
    expect(found).toBeNull();
  });

  it('returns false for a non-existent word id', async () => {
    const result = await deleteWord(999);
    expect(result).toBe(false);
  });

  it('cascades deletion to word_lists entries', async () => {
    const word = await insertWord();
    const { list } = (await createList('Fruits')) as { list: { id: number } };
    await linkWord(list.id, word.id);
    // Delete the word — word_lists entry should cascade-delete
    await deleteWord(word.id);
    // getWordsByListId should return empty
    const inList = await getWordsByListId(list.id);
    expect(inList).toHaveLength(0);
  });
});

describe('getWordsByListId', () => {
  beforeEach(clearAll);

  it('returns only words linked to that list', async () => {
    const word1 = await insertWord('alma', 'Apfel');
    const word2 = await insertWord('körte', 'Birne');
    const word3 = await insertWord('szilva', 'Pflaume');

    const { list: list1 } = (await createList('Fruits')) as { list: { id: number } };
    const { list: list2 } = (await createList('Others')) as { list: { id: number } };

    await linkWord(list1.id, word1.id);
    await linkWord(list1.id, word2.id);
    await linkWord(list2.id, word3.id);

    const result = await getWordsByListId(list1.id);
    const ids = result.map(w => w.id).sort();
    expect(ids).toEqual([word1.id, word2.id].sort());
  });

  it('returns empty array when no words are linked to the list', async () => {
    const { list } = (await createList('Empty')) as { list: { id: number } };
    const result = await getWordsByListId(list.id);
    expect(result).toEqual([]);
  });

  it('returns words with category field populated', async () => {
    const word = await insertWord();
    const { list } = (await createList('Test')) as { list: { id: number } };
    await linkWord(list.id, word.id);
    const result = await getWordsByListId(list.id);
    expect(result[0]).toHaveProperty('category');
    // rating=0 → category "New"
    expect(result[0].category).toBe('New');
  });
});

describe('getAllWords', () => {
  beforeEach(clearAll);

  it('returns all words with category', async () => {
    await insertWord('alma', 'Apfel');
    await insertWord('körte', 'Birne');
    const result = await getAllWords();
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('category');
  });
});

describe('addWord', () => {
  beforeEach(clearAll);

  it('creates a word with gender', async () => {
    const word = await addWord({ hungarian: 'alma', german: 'Apfel', gender: null });
    expect(word.id).toBeTypeOf('number');
    expect(word.hungarian).toBe('alma');
    expect(word.german).toBe('Apfel');
    expect(word.category).toBe('New');
  });
});
