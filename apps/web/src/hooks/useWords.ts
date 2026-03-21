import { useState, useEffect, useCallback } from 'react';
import type { WordWithCategory, AddWordInput } from '@vocab/shared';
import { api } from '../api/client';

export function useWords() {
  const [words, setWords] = useState<WordWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.words.list();
      setWords(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load words');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const addWord = useCallback(async (input: AddWordInput) => {
    const word = await api.words.add(input);
    setWords(prev => [word, ...prev]);
    return word;
  }, []);

  const updateWord = useCallback(async (id: number, input: AddWordInput) => {
    const word = await api.words.update(id, input);
    setWords(prev => prev.map(w => w.id === id ? word : w));
    return word;
  }, []);

  return { words, loading, error, refetch: fetchWords, addWord, updateWord };
}
