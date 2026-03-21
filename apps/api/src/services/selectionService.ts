import type { WordWithCategory } from '@vocab/shared';
import { getCategory } from '@vocab/shared';

const CATEGORY_WEIGHT: Record<string, number> = {
  New: 3,
  Learning: 2,
  Mastered: 1,
};

const RECENCY_FACTOR = 0.1;
const MIN_WEIGHT = 0.01;
const RECENT_BUFFER_SIZE = 5;

// In-memory circular buffer of recently practiced word IDs
const recentIds: number[] = [];

function getWeight(word: WordWithCategory): number {
  const base = CATEGORY_WEIGHT[getCategory(word.rating)] ?? 1;
  const recency = recentIds.includes(word.id) ? RECENCY_FACTOR : 1.0;
  return Math.max(base * recency, MIN_WEIGHT);
}

export function selectNextWord(words: WordWithCategory[]): WordWithCategory {
  if (words.length === 0) throw new Error('No words available');
  if (words.length === 1) return words[0];

  const weights = words.map(getWeight);
  const total = weights.reduce((a, b) => a + b, 0);

  let rand = Math.random() * total;
  for (let i = 0; i < words.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return words[i];
  }
  return words[words.length - 1];
}

export function recordPracticed(wordId: number): void {
  recentIds.push(wordId);
  if (recentIds.length > RECENT_BUFFER_SIZE) {
    recentIds.shift();
  }
}
