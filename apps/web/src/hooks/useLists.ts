import { useState, useCallback } from 'react';
import { api } from '../api/client';
import type { ListWithCount } from '@vocab/shared';

export function useLists() {
  const [lists, setLists] = useState<ListWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.lists.list();
      setLists(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  }, []);

  const createList = useCallback(async (name: string): Promise<string | null> => {
    try {
      const list = await api.lists.create(name);
      setLists(prev => [...prev, { ...list, wordCount: 0 }]);
      return null;
    } catch (e: any) {
      return e.message ?? 'Failed to create list';
    }
  }, []);

  const renameList = useCallback(async (id: number, name: string): Promise<string | null> => {
    try {
      const list = await api.lists.rename(id, name);
      setLists(prev => prev.map(l => l.id === id ? { ...list, wordCount: l.wordCount } : l));
      return null;
    } catch (e: any) {
      return e.message ?? 'Failed to rename list';
    }
  }, []);

  const deleteList = useCallback(async (id: number): Promise<void> => {
    await api.lists.delete(id);
    setLists(prev => prev.filter(l => l.id !== id));
  }, []);

  return { lists, loading, error, fetchLists, createList, renameList, deleteList };
}
