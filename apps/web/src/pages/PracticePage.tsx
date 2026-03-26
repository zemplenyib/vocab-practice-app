import { useState, useEffect } from 'react';
import { usePractice } from '../hooks/usePractice';
import { useLists } from '../hooks/useLists';
import { ListSelector } from '../components/lists/ListSelector';
import PracticeCard from '../components/practice/PracticeCard';

export default function PracticePage() {
  const { state, currentWord, result, error, loading, fetchNext, submitAnswer, reset } = usePractice();
  const { lists, fetchLists } = useLists();
  const [activeListId, setActiveListId] = useState<number | null>(null);

  useEffect(() => {
    fetchLists();
    return () => reset();
  }, [fetchLists, reset]);

  const activeList = activeListId !== null ? lists.find(l => l.id === activeListId) : null;
  const noWordsInList = activeListId !== null && activeList != null && activeList.wordCount === 0;

  if (state === 'IDLE') {
    return (
      <div className="max-w-md mx-auto mt-8 animate-fade-up">
        <div
          className="rounded-xl p-10 text-center space-y-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
        >
          <div>
            <h1 className="font-display text-4xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Practice
            </h1>
            <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
              words are weighted by how well you know them
            </p>
          </div>

          <ListSelector lists={lists} activeListId={activeListId} onChange={setActiveListId} />

          {error && (
            <p className="font-mono text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
          )}

          {noWordsInList && (
            <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              No words in this list
            </p>
          )}

          <button
            onClick={() => fetchNext(activeListId ?? undefined)}
            disabled={loading || noWordsInList}
            className="w-full rounded-md py-4 font-mono text-sm font-semibold transition-all duration-200"
            style={{
              background: 'var(--gold)',
              color: 'var(--bg)',
              opacity: loading || noWordsInList ? 0.6 : 1,
              cursor: loading || noWordsInList ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'loading...' : 'start practice →'}
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Practice
        </h1>
      </div>
      {error && <div className="font-mono text-xs mb-4" style={{ color: 'var(--danger)' }}>{error}</div>}
      <PracticeCard
        word={currentWord}
        result={result}
        loading={loading}
        onSubmit={submitAnswer}
        onNext={() => fetchNext(activeListId ?? undefined)}
      />
    </div>
  );
}
