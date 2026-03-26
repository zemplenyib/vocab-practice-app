import { useState } from 'react';

interface Props {
  currentName: string;
  onRename: (name: string) => Promise<string | null>;
  onClose: () => void;
}

export default function RenameListModal({ currentName, onRename, onClose }: Props) {
  const [value, setValue] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    setError(null);
    const err = await onRename(value.trim());
    setSaving(false);
    if (err) {
      setError(err);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 animate-fade-up"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
      >
        <h2 className="font-display text-xl font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
          Rename list
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              name
            </label>
            <input
              autoFocus
              className="w-full rounded-md px-3 py-2.5 font-mono text-sm outline-none transition-colors duration-150"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              value={value}
              onChange={e => setValue(e.target.value)}
              onFocus={e => (e.target.style.borderColor = 'var(--gold-dim)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
            />
          </div>

          {error && <p className="font-mono text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md py-2.5 font-mono text-sm transition-colors duration-150"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={saving || !value.trim()}
              className="flex-1 rounded-md py-2.5 font-mono text-sm font-medium transition-all duration-150"
              style={{ background: 'var(--gold)', color: 'var(--bg)', opacity: saving || !value.trim() ? 0.6 : 1 }}
            >
              {saving ? 'saving...' : 'save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
