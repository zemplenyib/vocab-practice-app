import type { WordWithCategory } from '@vocab/shared';
import WordCard from './WordCard';

interface Props {
  words: WordWithCategory[];
  onEdit?: (word: WordWithCategory) => void;
}

export default function WordList({ words, onEdit }: Props) {
  if (words.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No words yet. Add your first word to get started!
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {words.map(word => (
        <WordCard key={word.id} word={word} onEdit={onEdit ? () => onEdit(word) : undefined} />
      ))}
    </div>
  );
}
