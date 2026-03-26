import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLists } from '../hooks/useLists';
import { api } from '../api/client';
import RenameListModal from '../components/lists/RenameListModal';

interface ListRowProps {
  name: string;
  wordCount: number;
  href?: string;
  editable?: boolean;
  onRenameClick?: () => void;
  onDelete?: () => void;
}

function ListRow({ name, wordCount, href, editable = true, onRenameClick, onDelete }: ListRowProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const rowContent = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="font-mono text-base font-medium" style={{ color: 'var(--text-primary)' }}>
            {name}
          </span>
          <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
        {editable && (
          <div className="relative ml-3" ref={menuRef}>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setMenuOpen(prev => !prev); }}
              className="font-mono text-sm px-2 py-0.5 rounded"
              style={{ color: 'var(--text-muted)', background: 'transparent' }}
              aria-label="List options"
            >
              ...
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded-lg shadow-lg font-mono text-sm overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-accent)',
                  minWidth: '130px',
                }}
              >
                <button
                  className="flex items-center gap-2 text-left w-full px-4 py-2 transition-colors duration-100"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={e => { e.preventDefault(); e.stopPropagation(); onRenameClick?.(); setMenuOpen(false); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Rename
                </button>
                <button
                  className="flex items-center gap-2 text-left w-full px-4 py-2 transition-colors duration-100"
                  style={{ color: 'var(--danger)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete?.(); setMenuOpen(false); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M5 6V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  const rowStyle = {
    background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
    border: `1px solid ${hovered ? 'var(--border-accent)' : 'var(--border)'}`,
  };

  if (href) {
    return (
      <Link
        to={href}
        className="block rounded-lg px-5 py-4 transition-colors duration-200 cursor-pointer"
        style={{ ...rowStyle, textDecoration: 'none' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {rowContent}
      </Link>
    );
  }

  return (
    <div
      className="rounded-lg px-5 py-4 transition-colors duration-200"
      style={rowStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {rowContent}
    </div>
  );
}

export default function ListsPage() {
  const { lists, loading, error, fetchLists, createList, renameList, deleteList } = useLists();
  const [totalWordCount, setTotalWordCount] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [createValue, setCreateValue] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [renamingList, setRenamingList] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    fetchLists();
    api.words.list().then(words => setTotalWordCount(words.length)).catch(() => {});
  }, [fetchLists]);

  const handleCreate = async () => {
    if (!createValue.trim()) return;
    setCreating(true);
    setCreateError(null);
    const err = await createList(createValue.trim());
    setCreating(false);
    if (err) {
      setCreateError(err);
    } else {
      setCreateValue('');
      setShowCreate(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete list "${name}"? Words in this list will not be deleted.`)) return;
    await deleteList(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Lists
          </h1>
          <p className="font-mono text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {lists.length} {lists.length === 1 ? 'list' : 'lists'}
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="font-mono text-sm px-4 py-2 rounded-md transition-all duration-200"
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
            + new list
          </button>
        )}
      </div>

      {showCreate && (
        <div
          className="rounded-lg px-5 py-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
        >
          <div className="flex items-center gap-2">
            <input
              autoFocus
              placeholder="List name"
              value={createValue}
              onChange={e => setCreateValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') { setShowCreate(false); setCreateValue(''); setCreateError(null); }
              }}
              className="font-mono text-base flex-1 min-w-0 rounded px-2 py-0.5"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border-accent)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleCreate}
              disabled={creating || !createValue.trim()}
              className="font-mono text-sm px-4 py-2 rounded-md"
              style={{
                background: 'var(--gold)',
                color: 'var(--bg)',
                opacity: creating || !createValue.trim() ? 0.5 : 1,
                cursor: creating || !createValue.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              create
            </button>
            <button
              onClick={() => { setShowCreate(false); setCreateValue(''); setCreateError(null); }}
              className="font-mono text-sm px-4 py-2 rounded-md"
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              cancel
            </button>
          </div>
          {createError && (
            <p className="font-mono text-xs mt-2" style={{ color: 'var(--danger)' }}>
              {createError}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="font-mono text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
          loading...
        </div>
      )}
      {error && (
        <div className="font-mono text-sm text-center py-12" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-1.5">
          <ListRow
            name="Alle Wörter"
            wordCount={totalWordCount}
            href="/"
            editable={false}
          />
          {lists.map(list => (
            <ListRow
              key={list.id}
              name={list.name}
              wordCount={list.wordCount}
              href={`/lists/${list.id}`}
              editable={true}
              onRenameClick={() => setRenamingList({ id: list.id, name: list.name })}
              onDelete={() => handleDelete(list.id, list.name)}
            />
          ))}
          {lists.length === 0 && (
            <div className="text-center py-8 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
              no lists yet — create one to organise your words
            </div>
          )}
        </div>
      )}

      {renamingList && (
        <RenameListModal
          currentName={renamingList.name}
          onRename={(name) => renameList(renamingList.id, name)}
          onClose={() => setRenamingList(null)}
        />
      )}
    </div>
  );
}
