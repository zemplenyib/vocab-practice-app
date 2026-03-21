import type { Category } from '@vocab/shared';

const styles: Record<Category, string> = {
  New: 'bg-blue-100 text-blue-800',
  Learning: 'bg-yellow-100 text-yellow-800',
  Mastered: 'bg-green-100 text-green-800',
};

export default function WordBadge({ category }: { category: Category }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[category]}`}>
      {category}
    </span>
  );
}
