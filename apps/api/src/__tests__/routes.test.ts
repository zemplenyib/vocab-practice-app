/**
 * Integration tests for Hono route handlers.
 * Uses app.request() — no real HTTP server is started.
 * All database operations go to an in-memory SQLite instance.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { createTestDb } from './testDb.js';
import { words, lists, wordLists } from '@vocab/shared';

// Set up in-memory DB and mock before any service/route imports
const { db } = await createTestDb();

vi.mock('../db.js', () => ({ db }));

// Import routes AFTER mock is set up
const { wordsRouter } = await import('../routes/words.js');
const listsRouter = (await import('../routes/lists.js')).default;
const { practiceRouter } = await import('../routes/practice.js');

// Build a minimal app
const app = new Hono();
app.route('/api/words', wordsRouter);
app.route('/api/lists', listsRouter);
app.route('/api/practice', practiceRouter);

// Helpers
async function clearAll() {
  await db.delete(wordLists);
  await db.delete(lists);
  await db.delete(words);
}

async function insertWord(hungarian = 'alma', german = 'Apfel') {
  const [row] = await db.insert(words).values({ hungarian, german }).returning();
  return row;
}

async function createListViaDb(name: string) {
  const [row] = await db.insert(lists).values({ name }).returning();
  return row;
}

// --- Lists routes ---

describe('POST /api/lists', () => {
  beforeEach(clearAll);

  it('creates a list and returns 201', async () => {
    const res = await app.request('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Fruits' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { id: number; name: string };
    expect(body.name).toBe('Fruits');
    expect(body.id).toBeTypeOf('number');
  });

  it('returns 400 for protected name "Alle Wörter"', async () => {
    const res = await app.request('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alle Wörter' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for protected name in any casing', async () => {
    const res = await app.request('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'ALLE WÖRTER' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 409 for duplicate list name', async () => {
    await app.request('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Fruits' }),
    });
    const res = await app.request('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Fruits' }),
    });
    expect(res.status).toBe(409);
  });

  it('returns 400 for missing name field (zod validation error)', async () => {
    const res = await app.request('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/lists', () => {
  beforeEach(clearAll);

  it('returns empty array when no lists', async () => {
    const res = await app.request('/api/lists');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toEqual([]);
  });

  it('returns lists with wordCount', async () => {
    await createListViaDb('Fruits');
    const res = await app.request('/api/lists');
    const body = await res.json() as { name: string; wordCount: number }[];
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe('Fruits');
    expect(body[0]).toHaveProperty('wordCount');
  });
});

describe('PUT /api/lists/:id', () => {
  beforeEach(clearAll);

  it('renames a list and returns 200', async () => {
    const list = await createListViaDb('Fruits');
    const res = await app.request(`/api/lists/${list.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Vegetables' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { name: string };
    expect(body.name).toBe('Vegetables');
  });

  it('returns 404 for non-existent list', async () => {
    const res = await app.request('/api/lists/999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Anything' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 when renaming to protected name', async () => {
    const list = await createListViaDb('Fruits');
    const res = await app.request(`/api/lists/${list.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'alle wörter' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/lists/:id', () => {
  beforeEach(clearAll);

  it('deletes a list and returns 200', async () => {
    const list = await createListViaDb('Fruits');
    const res = await app.request(`/api/lists/${list.id}`, { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('returns 404 for non-existent list', async () => {
    const res = await app.request('/api/lists/999', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/lists/:id/words/:wordId', () => {
  beforeEach(clearAll);

  it('links a word to a list and returns 200', async () => {
    const list = await createListViaDb('Fruits');
    const word = await insertWord();
    const res = await app.request(`/api/lists/${list.id}/words/${word.id}`, { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('returns 404 for non-existent list', async () => {
    const word = await insertWord();
    const res = await app.request(`/api/lists/999/words/${word.id}`, { method: 'POST' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for non-existent word', async () => {
    const list = await createListViaDb('Fruits');
    const res = await app.request(`/api/lists/${list.id}/words/999`, { method: 'POST' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/lists/:id/words/:wordId', () => {
  beforeEach(clearAll);

  it('unlinks a word from a list and returns 200', async () => {
    const list = await createListViaDb('Fruits');
    const word = await insertWord();
    await db.insert(wordLists).values({ listId: list.id, wordId: word.id });
    const res = await app.request(`/api/lists/${list.id}/words/${word.id}`, { method: 'DELETE' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when link does not exist', async () => {
    const list = await createListViaDb('Fruits');
    const word = await insertWord();
    const res = await app.request(`/api/lists/${list.id}/words/${word.id}`, { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});

// --- Words routes ---

describe('GET /api/words', () => {
  beforeEach(clearAll);

  it('returns all words when no listId param', async () => {
    await insertWord('alma', 'Apfel');
    await insertWord('körte', 'Birne');
    const res = await app.request('/api/words');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(2);
  });

  it('returns 404 when listId refers to non-existent list', async () => {
    const res = await app.request('/api/words?listId=999');
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid (non-positive) listId', async () => {
    const res = await app.request('/api/words?listId=0');
    expect(res.status).toBe(400);
  });

  it('returns 400 for negative listId', async () => {
    const res = await app.request('/api/words?listId=-1');
    expect(res.status).toBe(400);
  });

  it('returns only words in the specified list', async () => {
    const list = await createListViaDb('Fruits');
    const word1 = await insertWord('alma', 'Apfel');
    await insertWord('körte', 'Birne'); // not in list
    await db.insert(wordLists).values({ listId: list.id, wordId: word1.id });

    const res = await app.request(`/api/words?listId=${list.id}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: number }[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(word1.id);
  });
});

describe('DELETE /api/words/:id', () => {
  beforeEach(clearAll);

  it('deletes a word and returns { ok: true }', async () => {
    const word = await insertWord();
    const res = await app.request(`/api/words/${word.id}`, { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('returns 404 for non-existent word', async () => {
    const res = await app.request('/api/words/999', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/words', () => {
  beforeEach(clearAll);

  it('creates a word and returns 201', async () => {
    const res = await app.request('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hungarian: 'alma', german: 'Apfel', gender: null }),
    });
    expect(res.status).toBe(201);
  });
});

// --- Practice routes ---

describe('GET /api/practice/next', () => {
  beforeEach(clearAll);

  it('returns 404 when listId refers to non-existent list', async () => {
    const res = await app.request('/api/practice/next?listId=999');
    expect(res.status).toBe(404);
  });

  it('returns 404 when list exists but has no words', async () => {
    const list = await createListViaDb('EmptyList');
    const res = await app.request(`/api/practice/next?listId=${list.id}`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid listId', async () => {
    const res = await app.request('/api/practice/next?listId=0');
    expect(res.status).toBe(400);
  });

  it('returns a word when list has words', async () => {
    const list = await createListViaDb('Fruits');
    const word = await insertWord();
    await db.insert(wordLists).values({ listId: list.id, wordId: word.id });
    const res = await app.request(`/api/practice/next?listId=${list.id}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { word: { id: number } };
    expect(body.word.id).toBe(word.id);
  });

  it('returns 404 when no words exist at all', async () => {
    const res = await app.request('/api/practice/next');
    expect(res.status).toBe(404);
  });

  it('returns a word when words exist (no listId)', async () => {
    await insertWord();
    const res = await app.request('/api/practice/next');
    expect(res.status).toBe(200);
    const body = await res.json() as { word: { id: number } };
    expect(body.word).toBeDefined();
  });
});
