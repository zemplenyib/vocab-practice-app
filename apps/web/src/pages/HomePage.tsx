import { useState } from 'react';
import { useWords } from '../hooks/useWords';
import WordList from '../components/words/WordList';
import AddWordModal from '../components/words/AddWordModal';
import EditWordModal from '../components/words/EditWordModal';
import type { AddWordInput, WordWithCategory } from '@vocab/shared';

export default function HomePage() {
  const { words, loading, error, addWord, updateWord } = useWords();
  const [showModal, setShowModal] = useState(false);
  const [editingWord, setEditingWord] = useState<WordWithCategory | null>(null);

  const handleAdd = async (input: AddWordInput) => {
    await addWord(input);
  };

  const handleUpdate = async (input: AddWordInput) => {
    if (editingWord) await updateWord(editingWord.id, input);
  };

  const newCount = words.filter(w => w.category === 'New').length;
  const learningCount = words.filter(w => w.category === 'Learning').length;
  const masteredCount = words.filter(w => w.category === 'Mastered').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Vocabulary ({words.length})
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add Word
        </button>
      </div>

      {!loading && !error && words.length > 0 && (
        <div className="flex gap-3">
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{newCount}</div>
            <div className="text-xs text-blue-500 font-medium mt-0.5">New</div>
          </div>
          <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{learningCount}</div>
            <div className="text-xs text-amber-500 font-medium mt-0.5">Learning</div>
          </div>
          <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{masteredCount}</div>
            <div className="text-xs text-emerald-500 font-medium mt-0.5">Mastered</div>
          </div>
        </div>
      )}

      {loading && <div className="text-gray-400 text-center py-8">Loading...</div>}
      {error && <div className="text-red-600 text-center py-8">{error}</div>}
      {!loading && !error && <WordList words={words} onEdit={setEditingWord} />}

      {showModal && (
        <AddWordModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}

      {editingWord && (
        <EditWordModal
          word={editingWord}
          onUpdate={handleUpdate}
          onClose={() => setEditingWord(null)}
        />
      )}
    </div>
  );
}
