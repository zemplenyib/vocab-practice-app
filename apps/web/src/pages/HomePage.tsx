import { useState, useEffect } from 'react';
import { useWords } from '../hooks/useWords';
import { useLists } from '../hooks/useLists';
import { ListSelector } from '../components/lists/ListSelector';
import WordList from '../components/words/WordList';
import AddWordModal from '../components/words/AddWordModal';
import EditWordModal from '../components/words/EditWordModal';
import StatPills from '../components/words/StatPills';
import { api } from '../api/client';
import type { AddWordInput, WordWithCategory } from '@vocab/shared';

export default function HomePage() {
  const { words, loading, error, refetch: fetchWords, addWord, updateWord, deleteWord, unlinkWord } = useWords();
  const { lists, fetchLists } = useLists();
  const [showModal, setShowModal] = useState(false);
  const [editingWord, setEditingWord] = useState<WordWithCategory | null>(null);
  const [activeListId, setActiveListId] = useState<number | null>(null);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  useEffect(() => {
    fetchWords(activeListId ?? undefined);
  }, [activeListId, fetchWords]);

  const handleAdd = async (input: AddWordInput) => {
    const newWord = await addWord(input);
    if (activeListId !== null) {
      await api.lists.linkWord(activeListId, newWord.id);
      fetchWords(activeListId);
    }
  };

  const handleUpdate = async (input: AddWordInput) => {
    if (editingWord) await updateWord(editingWord.id, input);
  };

  const handleDelete = async (word: WordWithCategory) => {
    if (activeListId === null) {
      if (!window.confirm(`Permanently delete "${word.hungarian}"?`)) return;
      await deleteWord(word.id);
    } else {
      if (!window.confirm(`Remove "${word.hungarian}" from this list?`)) return;
      await unlinkWord(activeListId, word.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Vocabulary
          </h1>
          <p className="font-mono text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {words.length} {words.length === 1 ? 'word' : 'words'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="font-mono text-sm px-4 py-2 rounded-md transition-all duration-200"
          style={{
            background: 'var(--gold-dim)',
            color: 'var(--gold)',
            border: '1px solid var(--gold-dim)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--gold)';
            e.currentTarget.style.color = 'var(--bg)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--gold-dim)';
            e.currentTarget.style.color = 'var(--gold)';
          }}
        >
          + add word
        </button>
      </div>

      <ListSelector lists={lists} activeListId={activeListId} onChange={setActiveListId} />

      {!loading && !error && words.length > 0 && <StatPills words={words} />}

      {loading && (
        <div className="font-mono text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
          loading...
        </div>
      )}
      {error && (
        <div className="font-mono text-sm text-center py-12" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {!loading && !error && <WordList words={words} onEdit={setEditingWord} onDelete={handleDelete} />}

      {showModal && <AddWordModal onAdd={handleAdd} onClose={() => setShowModal(false)} />}
      {editingWord && (
        <EditWordModal word={editingWord} onUpdate={handleUpdate} onClose={() => setEditingWord(null)} />
      )}
    </div>
  );
}
