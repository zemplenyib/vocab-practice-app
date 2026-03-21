import type { InferSelectModel } from 'drizzle-orm';
import type { words, practiceSessions } from './schema.js';

export type Word = InferSelectModel<typeof words>;
export type PracticeSession = InferSelectModel<typeof practiceSessions>;

export type Category = 'New' | 'Learning' | 'Mastered';

export const RATING_LEARNING_MAX = 6;
export const RATING_MAX = 10;

export function getCategory(rating: number): Category {
  if (rating === 0) return 'New';
  if (rating <= RATING_LEARNING_MAX) return 'Learning';
  return 'Mastered';
}

export type WordWithCategory = Word & { category: Category };

export type PracticeNextResponse = {
  word: WordWithCategory;
};

export type AnswerResult = {
  correct: boolean;
  correctGerman: string;
  correctGender: string | null;
  newRating: number;
  category: Category;
};
