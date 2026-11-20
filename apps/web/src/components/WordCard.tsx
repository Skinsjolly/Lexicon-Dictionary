import { Link } from 'react-router-dom';
import { ArrowUpRight, Volume2 } from 'lucide-react';
import type { DictionaryEntry } from '../types';

interface Props {
  entry: DictionaryEntry;
  note?: string;
}

export function WordCard({ entry, note }: Props) {
  const first = entry.meanings[0]?.definitions[0];
  const speak = () => {
    if (!entry.audio) return;
    new Audio(entry.audio).play().catch(() => undefined);
  };

  return (
    <div className="card group p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{entry.word}</h3>
            {entry.audio ? (
              <button
                type="button"
                onClick={speak}
                aria-label={`Pronounce ${entry.word}`}
                className="rounded-full p-1.5 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                <Volume2 size={15} />
              </button>
            ) : null}
          </div>
          {entry.phonetic ? <p className="mt-0.5 text-sm text-slate-400">{entry.phonetic}</p> : null}
        </div>
        <Link
          to={`/word/${encodeURIComponent(entry.word)}`}
          className="rounded-lg p-1.5 text-slate-300 transition group-hover:text-brand-600 dark:text-slate-600"
          aria-label={`Open ${entry.word}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {note ? <p className="mt-3 text-sm italic leading-6 text-brand-600 dark:text-brand-300">{note}</p> : null}

      {first ? (
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/5">
          <p className="label">{entry.meanings[0].partOfSpeech}</p>
          <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{first.definition}</p>
          {first.example ? (
            <p className="mt-2 line-clamp-2 text-xs italic text-slate-400">“{first.example}”</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
