import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Volume2 } from 'lucide-react';
import { AISentenceCard } from '../components/AISentenceCard';
import { MeaningSection } from '../components/MeaningSection';
import { Spinner } from '../components/Spinner';
import { api, getCachedAISentence } from '../lib/api';
import { useSavedWords } from '../hooks/useLocalLists';
import { WordHeader } from '../components/WordHeader';
import type { AIResult, WordOfDay } from '../types';

export function WordOfDayPage() {
  const [data, setData] = useState<WordOfDay | null>(null);
  const [ai, setAi] = useState<AIResult | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const { saved, add, remove } = useSavedWords();

  useEffect(() => {
    let active = true;
    api
      .wordOfTheDay()
      .then(async (result) => {
        if (!active) return;
        setData(result);
        const meanings = result.entry.meanings
          .flatMap((meaning) =>
            meaning.definitions.slice(0, 2).map((definition) => ({
              partOfSpeech: meaning.partOfSpeech,
              definition: definition.definition,
              example: definition.example,
            })),
          )
          .slice(0, 3);
        try {
          const generated = await getCachedAISentence(result.entry.word, meanings);
          if (active) setAi(generated);
        } catch {
          if (active) {
            setAi({
              available: false,
              configured: false,
              sentences: [],
              message: 'AI sentence generation is temporarily unavailable.',
            });
          }
        } finally {
          if (active) setAiLoading(false);
        }
      })
      .catch(() => {
        if (active) setAiLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-slate-400">
        <Spinner /> Loading today’s word…
      </div>
    );
  }

  const toggleSave = () => {
    if (saved.some((item) => item.word === data.entry.word)) {
      remove(data.entry.word);
      return;
    }
    add({
      word: data.entry.word,
      definition: data.note,
      phonetic: data.entry.phonetic,
      savedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-300">
          <CalendarDays size={14} /> {new Date(data.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold text-slate-900 dark:text-white">Word of the Day</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">A small daily dose of curiosity.</p>
      </div>

      <WordHeader entry={data.entry} saved={saved.some((item) => item.word === data.entry.word)} onToggleSave={toggleSave} />

      <div className="card flex items-start gap-3 p-6">
        <Volume2 size={18} className="mt-0.5 shrink-0 text-brand-500" />
        <div>
          <p className="label">Why this word</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{data.note}</p>
        </div>
      </div>

      <AISentenceCard result={ai} loading={aiLoading} word={data.entry.word} compact />

      {data.entry.meanings.map((meaning, index) => (
        <MeaningSection key={`${meaning.partOfSpeech}-${index}`} meaning={meaning} />
      ))}

      <div className="text-center">
        <Link to={`/word/${encodeURIComponent(data.entry.word)}`} className="btn-primary">
          Open full entry <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
