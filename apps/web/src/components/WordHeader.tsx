import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Check, Copy, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { DictionaryEntry } from '../types';

interface Props { entry: DictionaryEntry; saved: boolean; onToggleSave: () => void }

export function WordHeader({ entry, saved, onToggleSave }: Props) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const speak = () => {
    if (!entry.audio) return;
    new Audio(entry.audio).play().catch(() => undefined);
  };

  const copy = async () => {
    const text = entry.meanings
      .map((meaning) => `${meaning.partOfSpeech}: ${meaning.definitions.map((item) => item.definition).join('; ')}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(`${entry.word} — ${entry.phonetic || ''}\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="card relative overflow-hidden p-6 sm:p-9 animate-fade-up">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-500/10" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl dark:text-white">{entry.word}</h1>
            {entry.audio ? (
              <button type="button" onClick={speak} title="Play pronunciation" aria-label="Play pronunciation" className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-600 transition hover:scale-105 hover:bg-brand-100 dark:border-brand-400/30 dark:bg-brand-500/10 dark:text-brand-300">
                <Volume2 size={19} />
              </button>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            {entry.phonetic ? <span className="font-display text-lg text-slate-600 dark:text-slate-300">{entry.phonetic}</span> : null}
            {entry.syllables.length > 0 ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-white/5">{entry.syllables.join(' · ')}</span> : null}
            <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-300">
              {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy entry'}
            </button>
          </div>
          {entry.origin ? (
            <div className="mt-5 max-w-2xl border-l-2 border-brand-200 pl-4 dark:border-brand-500/30">
              <p className="label">Origin</p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{entry.origin}</p>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={onToggleSave} className={saved ? 'btn-primary' : 'btn-ghost'}>
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{saved ? 'Saved' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/dictionary')} className="btn-ghost">New search</button>
        </div>
      </div>
    </section>
  );
}
