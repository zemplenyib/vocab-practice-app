import type { WordWithCategory, AnswerResult } from '@vocab/shared';
import AnswerInput from './AnswerInput';
import ResultDisplay from './ResultDisplay';

interface Props {
  word: WordWithCategory;
  result: AnswerResult | null;
  loading: boolean;
  onSubmit: (german: string, gender: 'der' | 'die' | 'das' | null) => void;
  onNext: () => void;
}

export default function PracticeCard({ word, result, loading, onSubmit, onNext }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-indigo-500 shadow-sm p-6 space-y-6">
      <div className="text-center">
        <div className="text-xs font-medium text-indigo-400 uppercase tracking-wide mb-2">Translate to German</div>
        <div className="text-4xl font-bold text-gray-900">{word.hungarian}</div>
      </div>

      {result ? (
        <ResultDisplay result={result} onNext={onNext} />
      ) : (
        <AnswerInput onSubmit={onSubmit} disabled={loading} />
      )}
    </div>
  );
}
