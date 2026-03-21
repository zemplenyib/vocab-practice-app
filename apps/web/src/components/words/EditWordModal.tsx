import { useState } from 'react';
import type { WordWithCategory, AddWordInput } from '@vocab/shared';

interface Props {
  word: WordWithCategory;
  onUpdate: (input: AddWordInput) => Promise<void>;
  onClose: () => void;
}

export default function EditWordModal({ word, onUpdate, onClose }: Props) {
  const [hungarian, setHungarian] = useState(word.hungarian);
  const [german, setGerman] = useState(word.german);
  const [gender, setGender] = useState<'der' | 'die' | 'das' | ''>(word.gender ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onUpdate({ hungarian, german, gender: gender || null });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update word');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Edit Word</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hungarian</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={hungarian}
              onChange={e => setHungarian(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">German</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={german}
              onChange={e => setGerman(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender (optional)</label>
            <div className="flex gap-2">
              {(['der', 'die', 'das'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(gender === g ? '' : g)}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium border transition-colors ${
                    gender === g
                      ? g === 'der' ? 'bg-blue-500 border-blue-500 text-white'
                        : g === 'die' ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-yellow-400 border-yellow-400 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
