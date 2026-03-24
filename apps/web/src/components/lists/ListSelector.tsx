import type { ListWithCount } from '@vocab/shared';

interface Props {
  lists: ListWithCount[];
  activeListId: number | null;
  onChange: (listId: number | null) => void;
}

export function ListSelector({ lists, activeListId, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <button
        onClick={() => onChange(null)}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          padding: '0.25rem 0.75rem',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          cursor: 'pointer',
          background: activeListId === null ? 'var(--accent)' : 'transparent',
          color: activeListId === null ? '#000' : 'var(--text-muted)',
          fontWeight: activeListId === null ? 700 : 400,
        }}
      >
        Alle Wörter
      </button>
      {lists.map(list => (
        <button
          key={list.id}
          onClick={() => onChange(list.id)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            padding: '0.25rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            cursor: 'pointer',
            background: activeListId === list.id ? 'var(--accent)' : 'transparent',
            color: activeListId === list.id ? '#000' : 'var(--text-muted)',
            fontWeight: activeListId === list.id ? 700 : 400,
          }}
        >
          {list.name}
        </button>
      ))}
    </div>
  );
}
