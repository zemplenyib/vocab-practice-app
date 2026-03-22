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
    <div
      className="rounded-xl p-8 space-y-8 animate-fade-up"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
    >
      <div className="text-center space-y-2">
        <div className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          translate to german
        </div>
        <div className="font-display text-5xl font-semibold" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {word.hungarian}
        </div>
      </div>

      {result ? (
        <ResultDisplay result={result} onNext={onNext} />
      ) : (
        <AnswerInput onSubmit={onSubmit} disabled={loading} />
      )}
    </div>
  );
}
