import { useState, useCallback } from 'react';
import type { WordWithCategory, AnswerResult } from '@vocab/shared';
import { api } from '../api/client';

type State = 'IDLE' | 'AWAITING_ANSWER' | 'SHOWING_RESULT';

export function usePractice() {
  const [state, setState] = useState<State>('IDLE');
  const [currentWord, setCurrentWord] = useState<WordWithCategory | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNext = useCallback(async (listId?: number) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { word } = await api.practice.next(listId);
      setCurrentWord(word);
      setState('AWAITING_ANSWER');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load next word');
      setState('IDLE');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (german: string, gender: 'der' | 'die' | 'das' | null) => {
    if (!currentWord) return;
    setLoading(true);
    setError(null);
    try {
      const answerResult = await api.practice.answer({
        wordId: currentWord.id,
        german,
        gender: gender ?? undefined,
      });
      setResult(answerResult);
      setState('SHOWING_RESULT');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  }, [currentWord]);

  const reset = useCallback(() => {
    setState('IDLE');
    setCurrentWord(null);
    setResult(null);
    setError(null);
  }, []);

  return { state, currentWord, result, error, loading, fetchNext, submitAnswer, reset };
}
