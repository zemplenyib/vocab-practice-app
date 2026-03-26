import { useState } from 'react';
import type { WordWithCategory } from '@vocab/shared';
import WordBadge from './WordBadge';

interface Props {
  word: WordWithCategory;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

const categoryAccent: Record<string, string> = {
  New:      'var(--new)',
  Learning: 'var(--learning)',
  Mastered: 'var(--mastered)',
};

export default function WordCard({ word, onEdit, onDelete, index = 0 }: Props) {
  const [hovered, setHovered] = useState(false);
  const accent = categoryAccent[word.category];

  return (
    <div
      className="relative rounded-lg px-5 py-4 flex items-center justify-between transition-colors duration-200 animate-fade-up"
      style={{
        animationDelay: `${index * 30}ms`,
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-accent)' : 'var(--border)'}`,
        borderLeft: `3px solid ${accent}`,
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-base font-medium" style={{ color: 'var(--text-primary)' }}>
          {word.hungarian}
        </span>
        <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
          {word.gender ? <span style={{ color: word.gender === 'der' ? 'var(--der)' : word.gender === 'die' ? 'var(--die)' : 'var(--das)', marginRight: '0.25rem' }}>{word.gender}</span> : null}
          {word.german}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <WordBadge category={word.category} />
        {onEdit && (
          <button
            onClick={onEdit}
            aria-label="Edit word"
            className="transition-opacity duration-150"
            style={{ opacity: hovered ? 1 : 0, color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            aria-label="Delete word"
            className="transition-opacity duration-150"
            style={{ opacity: hovered ? 1 : 0, color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
