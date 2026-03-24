import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { AddWordSchema } from '@vocab/shared';
import { getAllWords, addWord, updateWord, deleteWord, getWordsByListId } from '../services/wordService.js';
import { getListById } from '../services/listService.js';

export const wordsRouter = new Hono();

wordsRouter.get('/', async (c) => {
  const rawListId = c.req.query('listId');
  if (rawListId !== undefined) {
    const listId = Number(rawListId);
    if (!Number.isInteger(listId) || listId <= 0) {
      return c.json({ error: 'Invalid listId' }, 400);
    }
    const list = await getListById(listId);
    if (!list) return c.json({ error: 'List not found' }, 404);
    const wordList = await getWordsByListId(listId);
    return c.json(wordList);
  }
  const wordList = await getAllWords();
  return c.json(wordList);
});

wordsRouter.post('/', zValidator('json', AddWordSchema), async (c) => {
  const input = c.req.valid('json');
  const word = await addWord(input);
  return c.json(word, 201);
});

wordsRouter.put('/:id', zValidator('json', AddWordSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const input = c.req.valid('json');
  const word = await updateWord(id, input);
  if (!word) return c.json({ error: 'Not found' }, 404);
  return c.json(word);
});

wordsRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const deleted = await deleteWord(id);
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});
