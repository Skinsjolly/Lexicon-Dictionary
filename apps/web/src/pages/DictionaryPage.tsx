import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { WordHeader } from '../components/WordHeader';
import { AISentenceCard } from '../components/AISentenceCard';
import { MeaningSection } from '../components/MeaningSection';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { api, ApiError, clearCachedAISentence, getCachedAISentence } from '../lib/api';
import { useHistory, useSavedWords } from '../hooks/useLocalLists';
import type { AIResult, DictionaryEntry } from '../types';

const toAIMeanings = (entry: DictionaryEntry) =>
  entry.meanings
    .flatMap((meaning) =>
      meaning.definitions
        .slice(0, 2)
        .map((definition) => ({
          partOfSpeech: meaning.partOfSpeech,
          definition: definition.definition,
          example: definition.example,
        })),
    )
    .slice(0, 3);

export function DictionaryPage() {
  const { word } = useParams();
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { record } = useHistory();
  const { saved, add, remove } = useSavedWords();

  const loadAI = useCallback(async (item: DictionaryEntry, force = false) => {
    const meanings = toAIMeanings(item);
    setAiLoading(true);
    try {
      const result = force
        ? await (clearCachedAISentence(item.word, meanings), api.aiSentence(item.word, meanings))
        : await getCachedAISentence(item.word, meanings);
      setAiResult(result);
    } catch {
      setAiResult({
        available: false,
        configured: false,
        sentences: [],
        message: 'AI sentence generation is temporarily unavailable.',
      });
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!word) return;
    const controller = new AbortController();
    setEntry(null);
    setAiResult(null);
    setError(null);
    setSuggestions([]);
    setLoading(true);

    api
      .dictionary(word)
      .then((data) => {
        setEntry(data);
        record({
          word: data.word,
          definition: data.meanings[0]?.definitions[0]?.definition || null,
          searchedAt: new Date().toISOString(),
        });
        return loadAI(data);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          setError(err.message);
          if (err.code === 'not_found') {
            api.suggestions(word).then((data) => setSuggestions(data.suggestions)).catch(() => undefined);
          }
        } else {
          setError('Something went wrong while loading this word.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [word, record, loadAI]);

  const toggleSave = () => {
    if (!entry) return;
    if (saved.some((item) => item.word === entry.word)) {
      remove(entry.word);
      return;
    }
    add({
      word: entry.word,
      definition: entry.meanings[0]?.definitions[0]?.definition || null,
      phonetic: entry.phonetic,
      savedAt: new Date().toISOString(),
    });
  };

  if (!word) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 py-10 animate-fade-up">
        <div className="text-center">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Search size={22} />
          </span>
          <h1 className="font-display text-4xl font-semibold text-slate-900 dark:text-white">Dictionary</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Look up any English word.</p>
        </div>
        <SearchBar autoFocus />
        <div className="grid gap-4 sm:grid-cols-3">
          {['ambitious', 'grass', 'resilient'].map((item) => (
            <Link key={item} to={`/word/${item}`} className="card p-5 text-center font-display text-xl text-brand-600 hover:-translate-y-0.5 dark:text-brand-300">
              {item}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 py-10">
        <div className="skeleton h-44 w-full rounded-2.5xl" />
        <div className="skeleton h-40 w-full rounded-2.5xl" />
        <div className="skeleton h-64 w-full rounded-2.5xl" />
        <p className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <Spinner /> Looking up “{word}”…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl animate-fade-up">
        <EmptyState
          icon={<Search size={24} />}
          title="We couldn't find that word"
          description={error}
          action={
            <div className="flex flex-col items-center gap-4">
              {suggestions.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((item) => (
                    <Link key={item} to={`/word/${item}`} className="chip">
                      {item}
                    </Link>
                  ))}
                </div>
              ) : null}
              <Link to="/dictionary" className="btn-primary">
                <ArrowLeft size={15} /> Try another word
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  if (!entry) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <WordHeader entry={entry} saved={saved.some((item) => item.word === entry.word)} onToggleSave={toggleSave} />

      <AISentenceCard result={aiResult} loading={aiLoading} word={entry.word} onRetry={() => loadAI(entry, true)} />

      <div className="flex items-center gap-2 pt-2">
        <Sparkles size={16} className="text-brand-500" />
        <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Definitions</h2>
      </div>

      {entry.meanings.map((meaning, index) => (
        <MeaningSection key={`${meaning.partOfSpeech}-${index}`} meaning={meaning} />
      ))}

      {entry.sourceUrls.length > 0 ? (
        <p className="pt-2 text-center text-[11px] text-slate-400">
          Source:{' '}
          {entry.sourceUrls.map((url, index) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="hover:text-brand-600 hover:underline">
              {index > 0 ? ', ' : ''}
              {new URL(url).hostname}
            </a>
          ))}
        </p>
      ) : null}
    </div>
  );
}
