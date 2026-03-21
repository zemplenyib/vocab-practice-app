import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { AddWordSchema } from '@vocab/shared';
import { getAllWords, addWord, updateWord } from '../services/wordService.js';

export const wordsRouter = new Hono();

wordsRouter.get('/', async (c) => {
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
