import { db } from '../db.js';
import { words, practiceSessions } from '@vocab/shared';
import type { AnswerResult, SubmitAnswerInput } from '@vocab/shared';
import { getCategory, RATING_MAX } from '@vocab/shared';
import { eq } from 'drizzle-orm';
import { getWordById, updateWordRating } from './wordService.js';
import { recordPracticed } from './selectionService.js';

export async function submitAnswer(input: SubmitAnswerInput): Promise<AnswerResult> {
  const word = await getWordById(input.wordId);
  if (!word) throw new Error(`Word not found: ${input.wordId}`);

  const germanMatch = input.german.trim().toLowerCase() === word.german.trim().toLowerCase();
  const genderMatch = word.gender === null || (input.gender ?? null) === word.gender;
  const correct = germanMatch && genderMatch;

  // First presentation: rating was 0 (New), bump to 1 regardless of answer
  const baseRating = word.rating === 0 ? 1 : word.rating;
  const newRating = correct
    ? Math.min(baseRating + 1, RATING_MAX)
    : Math.max(baseRating - 1, 1);

  await updateWordRating(word.id, newRating);

  await db.insert(practiceSessions).values({
    wordId: word.id,
    wasCorrect: correct,
  });

  recordPracticed(word.id);

  return {
    correct,
    correctGerman: word.german,
    correctGender: word.gender ?? null,
    newRating,
    category: getCategory(newRating),
  };
}
