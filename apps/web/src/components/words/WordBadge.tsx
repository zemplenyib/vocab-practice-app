import type { Category } from '@vocab/shared';

const styles: Record<Category, { color: string; bg: string; label: string }> = {
  New:      { color: 'var(--new)',      bg: 'var(--new-dim)',      label: 'new' },
  Learning: { color: 'var(--learning)', bg: 'var(--learning-dim)', label: 'learning' },
  Mastered: { color: 'var(--mastered)', bg: 'var(--mastered-dim)', label: 'mastered' },
};

export default function WordBadge({ category }: { category: Category }) {
  const { color, bg, label } = styles[category];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono font-medium"
      style={{ color, backgroundColor: bg, border: `1px solid ${color}33` }}
    >
      {label}
    </span>
  );
}
