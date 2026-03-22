import type { WordWithCategory } from '@vocab/shared';
import WordCard from './WordCard';

interface Props {
  words: WordWithCategory[];
  onEdit?: (word: WordWithCategory) => void;
}

export default function WordList({ words, onEdit }: Props) {
  if (words.length === 0) {
    return (
      <div className="text-center py-16 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
        no words yet — add one to begin
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {words.map((word, i) => (
        <WordCard
          key={word.id}
          word={word}
          index={i}
          onEdit={onEdit ? () => onEdit(word) : undefined}
        />
      ))}
    </div>
  );
}
