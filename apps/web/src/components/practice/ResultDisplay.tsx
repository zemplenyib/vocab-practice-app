import type { AnswerResult } from '@vocab/shared';
import WordBadge from '../words/WordBadge';

interface Props {
  result: AnswerResult;
  onNext: () => void;
}

export default function ResultDisplay({ result, onNext }: Props) {
  const correct = result.correct;
  const color = correct ? 'var(--mastered)' : 'var(--danger)';
  const dim = correct ? 'var(--mastered-dim)' : 'var(--danger-dim)';

  return (
    <div className="space-y-4 animate-fade-up">
      <div
        className="rounded-lg p-6 text-center"
        style={{ background: dim, border: `1px solid ${color}44` }}
      >
        <div className="font-mono text-4xl mb-2" style={{ color }}>
          {correct ? '✓' : '✗'}
        </div>
        <div className="font-display text-2xl font-semibold mb-3" style={{ color }}>
          {correct ? 'Correct' : 'Incorrect'}
        </div>
        <div
          className="inline-block rounded-md px-4 py-2 font-mono text-base"
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          {result.correctGender
            ? <span style={{ color: result.correctGender === 'der' ? 'var(--new)' : result.correctGender === 'die' ? 'var(--danger)' : 'var(--learning)', marginRight: '0.35rem' }}>{result.correctGender}</span>
            : null}
          {result.correctGerman}
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          rating → {result.newRating}
        </span>
        <WordBadge category={result.category} />
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-md py-3 font-mono text-sm font-semibold transition-all duration-200"
        style={{ background: 'var(--gold)', color: 'var(--bg)' }}
      >
        next word →
      </button>
    </div>
  );
}
