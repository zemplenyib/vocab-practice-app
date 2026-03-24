import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { SubmitAnswerSchema } from '@vocab/shared';
import { getAllWords, getWordsByListId } from '../services/wordService.js';
import { getListById } from '../services/listService.js';
import { selectNextWord } from '../services/selectionService.js';
import { submitAnswer } from '../services/practiceService.js';

export const practiceRouter = new Hono();

practiceRouter.get('/next', async (c) => {
  const rawListId = c.req.query('listId');
  let allWords;
  if (rawListId !== undefined) {
    const listId = Number(rawListId);
    if (!Number.isInteger(listId) || listId <= 0) {
      return c.json({ error: 'Invalid listId' }, 400);
    }
    const list = await getListById(listId);
    if (!list) return c.json({ error: 'List not found' }, 404);
    allWords = await getWordsByListId(listId);
  } else {
    allWords = await getAllWords();
  }
  if (allWords.length === 0) {
    return c.json({ error: 'No words available' }, 404);
  }
  const word = selectNextWord(allWords);
  return c.json({ word });
});

practiceRouter.post('/answer', zValidator('json', SubmitAnswerSchema), async (c) => {
  const input = c.req.valid('json');
  const result = await submitAnswer(input);
  return c.json(result);
});
