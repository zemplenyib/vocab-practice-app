import type { WordWithCategory } from '@vocab/shared';
import WordBadge from './WordBadge';

interface Props {
  word: WordWithCategory;
  onEdit?: () => void;
}

export default function WordCard({ word, onEdit }: Props) {
  const borderClass =
    word.category === 'New' ? 'border-l-blue-400' :
    word.category === 'Learning' ? 'border-l-amber-400' :
    'border-l-emerald-400';

  return (
    <div className={`group relative bg-white rounded-lg border border-gray-200 border-l-4 ${borderClass} p-4 flex items-center justify-between shadow-sm`}>
      <div>
        <div className="font-semibold text-gray-900 text-base">{word.hungarian}</div>
        <div className="text-gray-500 text-sm mt-0.5">
          {word.gender ? `${word.gender} ` : ''}{word.german}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <WordBadge category={word.category} />
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          aria-label="Edit word"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      )}
    </div>
  );
}
