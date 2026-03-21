import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { SubmitAnswerSchema } from '@vocab/shared';
import { getAllWords } from '../services/wordService.js';
import { selectNextWord } from '../services/selectionService.js';
import { submitAnswer } from '../services/practiceService.js';

export const practiceRouter = new Hono();

practiceRouter.get('/next', async (c) => {
  const allWords = await getAllWords();
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
