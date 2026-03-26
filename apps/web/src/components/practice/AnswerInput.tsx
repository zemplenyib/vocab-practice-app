import { useState } from 'react';

interface Props {
  onSubmit: (german: string, gender: 'der' | 'die' | 'das' | null) => void;
  disabled?: boolean;
}

const genderConfig = [
  { g: 'der' as const, color: 'var(--der)',  dim: 'var(--der-dim)' },
  { g: 'die' as const, color: 'var(--die)', dim: 'var(--danger-dim)' },
  { g: 'das' as const, color: 'var(--das)', dim: 'var(--das-dim)' },
];

export default function AnswerInput({ onSubmit, disabled }: Props) {
  const [german, setGerman] = useState('');
  const [gender, setGender] = useState<'der' | 'die' | 'das' | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(german.replaceAll('ss', 'ß'), gender || null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>

        <div className="flex gap-2">
          {genderConfig.map(({ g, color, dim }) => {
            const active = gender === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGender(gender === g ? '' : g)}
                className="flex-1 rounded-md py-3 font-mono text-base font-semibold transition-all duration-150"
                style={{
                  background: active ? color : dim,
                  color: active ? 'var(--bg)' : color,
                  border: `1px solid ${active ? color : `${color}33`}`,
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div>

        <input
          className="w-full rounded-md px-4 py-3 font-mono text-lg outline-none transition-colors duration-150"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          value={german}
          onChange={e => setGerman(e.target.value)}
          placeholder="type here..."
          autoFocus

          onFocus={e => (e.target.style.borderColor = 'var(--gold-dim)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-md py-3 font-mono text-sm font-semibold transition-all duration-200"
        style={{
          background: 'var(--gold)',
          color: 'var(--bg)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        submit
      </button>
    </form>
  );
}
