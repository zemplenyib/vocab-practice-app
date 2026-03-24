import { useState, useEffect } from 'react';
import { useLists } from '../hooks/useLists';
import { api } from '../api/client';

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

interface ListRowProps {
  name: string;
  wordCount: number;
  editable?: boolean;
  onRename?: (name: string) => Promise<string | null>;
  onDelete?: () => void;
}

function ListRow({ name, wordCount, editable = true, onRename, onDelete }: ListRowProps) {
  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleRenameConfirm = async () => {
    if (!onRename) return;
    setSaving(true);
    setRenameError(null);
    const err = await onRename(renameValue);
    setSaving(false);
    if (err) {
      setRenameError(err);
    } else {
      setRenaming(false);
    }
  };

  const handleRenameCancel = () => {
    setRenaming(false);
    setRenameValue(name);
    setRenameError(null);
  };

  return (
    <div
      className="rounded-lg px-5 py-4 transition-colors duration-200"
      style={{
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-accent)' : 'var(--border)'}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {renaming ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameConfirm();
                  if (e.key === 'Escape') handleRenameCancel();
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
                onClick={handleRenameConfirm}
                disabled={saving || !renameValue.trim()}
                className="font-mono text-xs px-3 py-1 rounded"
                style={{
                  background: 'var(--gold)',
                  color: 'var(--bg)',
                  opacity: saving || !renameValue.trim() ? 0.5 : 1,
                  cursor: saving || !renameValue.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                save
              </button>
              <button
                onClick={handleRenameCancel}
                className="font-mono text-xs px-3 py-1 rounded"
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
          ) : (
            <span className="font-mono text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              {name}
            </span>
          )}
          {!renaming && (
            <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          )}
        </div>
        {editable && !renaming && (
          <div className="flex items-center gap-2 ml-3">
            {onRename && (
              <button
                onClick={() => { setRenameValue(name); setRenaming(true); }}
                aria-label="Rename list"
                className="transition-opacity duration-150"
                style={{ opacity: hovered ? 1 : 0, color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <PencilIcon />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                aria-label="Delete list"
                className="transition-opacity duration-150"
                style={{ opacity: hovered ? 1 : 0, color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        )}
      </div>
      {renameError && (
        <p className="font-mono text-xs mt-2" style={{ color: 'var(--danger)' }}>
          {renameError}
        </p>
      )}
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
            editable={false}
          />
          {lists.map(list => (
            <ListRow
              key={list.id}
              name={list.name}
              wordCount={list.wordCount}
              editable={true}
              onRename={(name) => renameList(list.id, name)}
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
    </div>
  );
}
