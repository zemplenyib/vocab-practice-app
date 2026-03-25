import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWords } from '../hooks/useWords';
import WordList from '../components/words/WordList';
import EditWordModal from '../components/words/EditWordModal';
import StatPills from '../components/words/StatPills';
import { api } from '../api/client';
import type { AddWordInput, ListWithCount, WordWithCategory } from '@vocab/shared';

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const listId = Number(id);

  const [listMeta, setListMeta] = useState<ListWithCount | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState<WordWithCategory | null>(null);

  const { words, loading, error: wordsError, refetch } = useWords();

  useEffect(() => {
    refetch(listId);
  }, [listId, refetch]);

  useEffect(() => {
    api.lists.get(listId)
      .then(setListMeta)
      .catch(() => setMetaError('List not found'));
  }, [listId]);

  const handleUpdate = async (input: AddWordInput) => {
    if (editingWord) await api.words.update(editingWord.id, input);
    refetch(listId);
  };

  const handleDelete = async (word: WordWithCategory) => {
    if (!window.confirm(`Remove "${word.hungarian}" from this list?`)) return;
    await api.lists.unlinkWord(listId, word.id);
    refetch(listId);
  };

  if (metaError) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="font-mono text-sm text-center py-12" style={{ color: 'var(--danger)' }}>
          List not found
        </div>
        <div className="text-center">
          <Link
            to="/lists"
            className="font-mono text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            ← back to lists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/lists"
          className="flex items-center transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronLeftIcon />
        </Link>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {listMeta ? listMeta.name : '—'}
        </h1>
      </div>

      {!loading && !wordsError && words.length > 0 && <StatPills words={words} />}

      <div className="flex items-center justify-between">
        <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
          {words.length} {words.length === 1 ? 'word' : 'words'}
        </p>
        <Link
          to={`/lists/${id}/add`}
          className="font-mono text-sm px-4 py-2 rounded-md transition-all duration-200"
          style={{
            background: 'var(--gold-dim)',
            color: 'var(--gold)',
            border: '1px solid var(--gold-dim)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--gold)';
            (e.currentTarget as HTMLElement).style.color = 'var(--bg)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--gold-dim)';
            (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
          }}
        >
          + add words
        </Link>
      </div>

      {loading && (
        <div className="font-mono text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
          loading...
        </div>
      )}
      {wordsError && (
        <div className="font-mono text-sm text-center py-12" style={{ color: 'var(--danger)' }}>
          {wordsError}
        </div>
      )}

      {!loading && !wordsError && words.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
            No words in this list yet
          </p>
          <Link
            to={`/lists/${id}/add`}
            className="inline-block font-mono text-sm px-4 py-2 rounded-md transition-all duration-200"
            style={{
              background: 'var(--gold-dim)',
              color: 'var(--gold)',
              border: '1px solid var(--gold-dim)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--gold)';
              (e.currentTarget as HTMLElement).style.color = 'var(--bg)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--gold-dim)';
              (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
            }}
          >
            + add words
          </Link>
        </div>
      )}

      {!loading && !wordsError && words.length > 0 && (
        <WordList words={words} onEdit={setEditingWord} onDelete={handleDelete} />
      )}

      {editingWord && (
        <EditWordModal
          word={editingWord}
          onUpdate={handleUpdate}
          onClose={() => setEditingWord(null)}
        />
      )}
    </div>
  );
}
