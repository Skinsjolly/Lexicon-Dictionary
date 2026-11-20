import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, Bookmark, Trash2 } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { useSavedWords } from '../hooks/useLocalLists';
export function SavedPage() {
  const { saved, remove } = useSavedWords();
  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-up">
      <div><p className="label">Your vocabulary</p><h1 className="mt-1 font-display text-4xl font-semibold text-slate-900 dark:text-white">Saved Words</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Build a personal word list {saved.length > 0 ? `— ${saved.length} saved so far.` : 'as you explore.'}</p></div>
      {saved.length === 0 ? (
        <EmptyState icon={<BookMarked size={24} />} title="No saved words yet" description="Tap Save on any dictionary entry to keep it here for later." action={<Link to="/dictionary" className="btn-primary">Find a word</Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {saved.map((item) => (
            <div key={item.word} className="card group relative p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <button type="button" onClick={() => remove(item.word)} title={`Remove ${item.word}`} className="absolute right-4 top-4 rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-600 dark:hover:bg-rose-500/10"><Trash2 size={15} /></button>
              <div className="flex items-center gap-2"><Bookmark size={16} className="fill-brand-500 text-brand-500" /><h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{item.word}</h2></div>
              {item.phonetic ? <p className="mt-1 text-sm text-slate-400">{item.phonetic}</p> : null}
              {item.definition ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.definition}</p> : null}
              <Link to={`/word/${encodeURIComponent(item.word)}`} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">Open entry <ArrowRight size={13} /></Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
