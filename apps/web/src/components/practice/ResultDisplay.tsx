import type { AnswerResult } from '@vocab/shared';
import WordBadge from '../words/WordBadge';

interface Props {
  result: AnswerResult;
  onNext: () => void;
}

export default function ResultDisplay({ result, onNext }: Props) {
  return (
    <div className="space-y-4">
      <div className={`rounded-lg p-5 text-center border-2 ${result.correct ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-400'}`}>
        <div className={`text-4xl mb-2 ${result.correct ? 'text-emerald-500' : 'text-red-500'}`}>
          {result.correct ? '✓' : '✗'}
        </div>
        <div className={`text-2xl font-bold mb-2 ${result.correct ? 'text-emerald-700' : 'text-red-700'}`}>
          {result.correct ? 'Correct!' : 'Incorrect'}
        </div>
        <div className="inline-block bg-white rounded-md px-4 py-2 text-gray-700 text-sm font-medium border border-gray-200 mt-1">
          {result.correctGender ? `${result.correctGender} ` : ''}{result.correctGerman}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>New rating: {result.newRating.toFixed(1)}</span>
        <WordBadge category={result.category} />
      </div>
      <button
        onClick={onNext}
        className="w-full bg-indigo-600 text-white rounded-md px-4 py-3 font-medium hover:bg-indigo-700 transition-colors"
      >
        Next Word
      </button>
    </div>
  );
}
