import type { WordWithCategory } from '@vocab/shared';

export function StatPill({ count, label, color, dim }: { count: number; label: string; color: string; dim?: string }) {
  return (
    <div
      className="flex-1 rounded-lg px-4 py-3 text-center"
      style={{ background: dim, border: `1px solid ${color}33` }}
    >
      <div className="font-mono text-2xl font-semibold" style={{ color }}>{count}</div>
      <div className="font-mono text-xs mt-0.5" style={{ color: `${color}99` }}>{label}</div>
    </div>
  );
}

export default function StatPills({ words }: { words: WordWithCategory[] }) {
  const newCount = words.filter(w => w.category === 'New').length;
  const learningCount = words.filter(w => w.category === 'Learning').length;
  const masteredCount = words.filter(w => w.category === 'Mastered').length;

  return (
    <div className="flex gap-2">
      <StatPill count={newCount} label="new" color="var(--new)" dim="var(--new-dim)" />
      <StatPill count={learningCount} label="learning" color="var(--learning)" dim="var(--learning-dim)" />
      <StatPill count={masteredCount} label="mastered" color="var(--mastered)" dim="var(--mastered-dim)" />
    </div>
  );
}
