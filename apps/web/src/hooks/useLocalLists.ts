import { useCallback, useEffect, useState } from 'react';
import { addHistory, clearHistory, getHistory, getSavedWords, removeSavedWord, saveWord } from '../lib/storage';
import type { HistoryItem, SavedWord } from '../types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory());

  const record = useCallback((item: HistoryItem) => setHistory(addHistory(item)), []);
  const clear = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  useEffect(() => {
    const sync = () => setHistory(getHistory());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return { history, record, clear };
}

export function useSavedWords() {
  const [saved, setSaved] = useState<SavedWord[]>(() => getSavedWords());

  const add = useCallback((item: SavedWord) => setSaved(saveWord(item)), []);
  const remove = useCallback((word: string) => setSaved(removeSavedWord(word)), []);
  const has = useCallback((word: string) => saved.some((item) => item.word === word), [saved]);

  useEffect(() => {
    const sync = () => setSaved(getSavedWords());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return { saved, add, remove, has };
}
