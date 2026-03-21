import { useState } from 'react';

interface Props {
  onSubmit: (german: string, gender: 'der' | 'die' | 'das' | null) => void;
  disabled?: boolean;
}

export default function AnswerInput({ onSubmit, disabled }: Props) {
  const [german, setGerman] = useState('');
  const [gender, setGender] = useState<'der' | 'die' | 'das' | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(german, gender || null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setGender(gender === 'der' ? '' : 'der')}
            className={`flex-1 py-3 px-6 rounded-md border-2 text-base font-semibold transition-colors ${
              gender === 'der'
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white text-gray-500 border-gray-300 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            der
          </button>
          <button
            type="button"
            onClick={() => setGender(gender === 'die' ? '' : 'die')}
            className={`flex-1 py-3 px-6 rounded-md border-2 text-base font-semibold transition-colors ${
              gender === 'die'
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-white text-gray-500 border-gray-300 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            die
          </button>
          <button
            type="button"
            onClick={() => setGender(gender === 'das' ? '' : 'das')}
            className={`flex-1 py-3 px-6 rounded-md border-2 text-base font-semibold transition-colors ${
              gender === 'das'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-white text-gray-500 border-gray-300 hover:border-emerald-300 hover:text-emerald-600'
            }`}
          >
            das
          </button>
        </div>
        {!gender && (
          <p className="text-xs text-gray-400 mt-1">No gender selected — leave blank if not applicable</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">German translation</label>
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={german}
          onChange={e => setGerman(e.target.value)}
          placeholder="Type German word..."
          autoFocus
          required
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-indigo-600 text-white rounded-md px-4 py-3 font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        Submit Answer
      </button>
    </form>
  );
}
