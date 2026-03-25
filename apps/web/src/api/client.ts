import type { WordWithCategory, AnswerResult, PracticeNextResponse, AddWordInput, SubmitAnswerInput, List, ListWithCount } from '@vocab/shared';

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
    list: (listId?: number) => request<WordWithCategory[]>('GET', listId != null ? `/words?listId=${listId}` : '/words'),
    add: (input: AddWordInput) => request<WordWithCategory>('POST', '/words', input),
    update: (id: number, input: AddWordInput) => request<WordWithCategory>('PUT', `/words/${id}`, input),
    delete: (id: number) => request<void>('DELETE', `/words/${id}`),
  },
  practice: {
    next: (listId?: number) => request<PracticeNextResponse>('GET', listId != null ? `/practice/next?listId=${listId}` : '/practice/next'),
    answer: (input: SubmitAnswerInput) => request<AnswerResult>('POST', '/practice/answer', input),
  },
  lists: {
    list: () => request<ListWithCount[]>('GET', '/lists'),
    get: (id: number) => request<ListWithCount>('GET', `/lists/${id}`),
    create: (name: string) => request<List>('POST', '/lists', { name }),
    rename: (id: number, name: string) => request<List>('PUT', `/lists/${id}`, { name }),
    delete: (id: number) => request<void>('DELETE', `/lists/${id}`),
    linkWord: (listId: number, wordId: number) => request<void>('POST', `/lists/${listId}/words/${wordId}`),
    unlinkWord: (listId: number, wordId: number) => request<void>('DELETE', `/lists/${listId}/words/${wordId}`),
  },
};
