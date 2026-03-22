import { useState } from 'react';
import type { AddWordInput } from '@vocab/shared';

interface Props {
  onAdd: (input: AddWordInput) => Promise<void>;
  onClose: () => void;
}

const genderColors: Record<'der' | 'die' | 'das', string> = {
  der: 'var(--new)',
  die: 'var(--danger)',
  das: 'var(--learning)',
};

export default function AddWordModal({ onAdd, onClose }: Props) {
  const [hungarian, setHungarian] = useState('');
  const [german, setGerman] = useState('');
  const [gender, setGender] = useState<'der' | 'die' | 'das' | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onAdd({ hungarian, german, gender: gender || null });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add word');
    } finally {
      setSubmitting(false);
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
          Add word
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Hungarian', value: hungarian, onChange: setHungarian, focus: true },
            { label: 'German', value: german, onChange: setGerman, focus: false },
          ].map(({ label, value, onChange, focus }) => (
            <div key={label}>
              <label className="block font-mono text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {label.toLowerCase()}
              </label>
              <input
                className="w-full rounded-md px-3 py-2.5 font-mono text-sm outline-none transition-colors duration-150"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                value={value}
                onChange={e => onChange(e.target.value)}
                required
                autoFocus={focus}
                onFocus={e => (e.target.style.borderColor = 'var(--gold-dim)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          ))}

          <div>
            <label className="block font-mono text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              gender <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>(optional)</span>
            </label>
            <div className="flex gap-2">
              {(['der', 'die', 'das'] as const).map(g => {
                const active = gender === g;
                const color = genderColors[g];
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(gender === g ? '' : g)}
                    className="flex-1 rounded-md py-2 font-mono text-sm font-medium transition-all duration-150"
                    style={{
                      background: active ? color : 'var(--bg)',
                      color: active ? 'var(--bg)' : color,
                      border: `1px solid ${active ? color : `${color}44`}`,
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
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
              disabled={submitting}
              className="flex-1 rounded-md py-2.5 font-mono text-sm font-medium transition-all duration-150"
              style={{ background: 'var(--gold)', color: 'var(--bg)', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'adding...' : 'add word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
