import { useEffect } from 'react';
import { usePractice } from '../hooks/usePractice';
import PracticeCard from '../components/practice/PracticeCard';

export default function PracticePage() {
  const { state, currentWord, result, error, loading, fetchNext, submitAnswer, reset } = usePractice();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  if (state === 'IDLE') {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-indigo-500 shadow-sm p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Practice</h1>
          <p className="text-gray-500">Test your vocabulary — words are selected by how well you know them.</p>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            onClick={fetchNext}
            disabled={loading}
            className="mt-2 w-full bg-indigo-600 text-white rounded-md px-8 py-4 text-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Start Practice'}
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Practice</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <PracticeCard
        word={currentWord}
        result={result}
        loading={loading}
        onSubmit={submitAnswer}
        onNext={fetchNext}
      />
    </div>
  );
}
