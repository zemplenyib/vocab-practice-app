import type { WordWithCategory, AnswerResult, PracticeNextResponse, AddWordInput, SubmitAnswerInput } from '@vocab/shared';

const BASE = '/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  words: {
    list: () => request<WordWithCategory[]>('GET', '/words'),
    add: (input: AddWordInput) => request<WordWithCategory>('POST', '/words', input),
    update: (id: number, input: AddWordInput) => request<WordWithCategory>('PUT', `/words/${id}`, input),
  },
  practice: {
    next: () => request<PracticeNextResponse>('GET', '/practice/next'),
    answer: (input: SubmitAnswerInput) => request<AnswerResult>('POST', '/practice/answer', input),
  },
};
