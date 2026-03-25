import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { ListWithCount, WordWithCategory } from '@vocab/shared';

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function AddWordsPage() {
  const { id } = useParams<{ id: string }>();
  const listId = Number(id);

  const [listMeta, setListMeta] = useState<ListWithCount | null>(null);
  const [allWords, setAllWords] = useState<WordWithCategory[]>([]);
  const [linkedIds, setLinkedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.lists.get(listId),
      api.words.list(),
      api.words.list(listId),
    ])
      .then(([meta, all, inList]) => {
        setListMeta(meta);
        setAllWords(all);
        setLinkedIds(new Set(inList.map(w => w.id)));
      })
      .catch(() => setError('List not found'));
  }, [listId]);

  const handleLink = async (wordId: number) => {
    setLinkedIds(prev => new Set(prev).add(wordId));
    try {
      await api.lists.linkWord(listId, wordId);
    } catch {
      setLinkedIds(prev => {
        const next = new Set(prev);
        next.delete(wordId);
        return next;
      });
    }
  };

  if (error) {
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

  const lowerSearch = search.toLowerCase();
  const filtered = allWords.filter(w =>
    w.german.toLowerCase().includes(lowerSearch) ||
    w.hungarian.toLowerCase().includes(lowerSearch)
  );

  const unlinkedFiltered = filtered.filter(w => !linkedIds.has(w.id));
  const linkedFiltered = filtered.filter(w => linkedIds.has(w.id));
  const displayWords = [...unlinkedFiltered, ...linkedFiltered];

  const allLinked = allWords.length > 0 && allWords.every(w => linkedIds.has(w.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to={`/lists/${id}`}
          className="flex items-center transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronLeftIcon />
        </Link>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Add words to {listMeta ? listMeta.name : '—'}
        </h1>
      </div>

      <input
        type="text"
        placeholder="Search German or Hungarian..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-md px-3 py-2.5 font-mono text-sm outline-none transition-colors duration-150"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--gold-dim)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />

      {allLinked && !search && (
        <div className="font-mono text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
          All words are already in this list
        </div>
      )}

      {!allLinked && search && displayWords.length === 0 && (
        <div className="font-mono text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
          No words match your search
        </div>
      )}

      {displayWords.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {displayWords.map(word => {
            const linked = linkedIds.has(word.id);
            return (
              <div
                key={word.id}
                className="rounded-lg px-5 py-3 flex items-center justify-between"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  opacity: linked ? 0.45 : 1,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {word.hungarian}
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {word.gender ? `${word.gender} ` : ''}{word.german}
                  </span>
                </div>
                {!linked && (
                  <button
                    onClick={() => handleLink(word.id)}
                    className="font-mono text-sm px-3 py-1 rounded-md ml-3 flex-shrink-0 transition-all duration-150"
                    style={{
                      background: 'var(--gold-dim)',
                      color: 'var(--gold)',
                      border: '1px solid var(--gold-dim)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--gold)';
                      e.currentTarget.style.color = 'var(--bg)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--gold-dim)';
                      e.currentTarget.style.color = 'var(--gold)';
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
