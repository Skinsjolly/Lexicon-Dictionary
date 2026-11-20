import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, History, Trash2 } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { useHistory } from '../hooks/useLocalLists';
export function HistoryPage() {
  const { history, clear } = useHistory();
  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="label">Your activity</p><h1 className="mt-1 font-display text-4xl font-semibold text-slate-900 dark:text-white">Search History</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Words you looked up, saved on this device.</p></div>
        {history.length > 0 ? <button type="button" onClick={() => { if (window.confirm('Clear all search history?')) clear(); }} className="btn-ghost !text-rose-600 dark:!text-rose-400"><Trash2 size={15} /> Clear history</button> : null}
      </div>
      <SearchBar variant="compact" placeholder="Search another word…" />
      {history.length === 0 ? (
        <EmptyState icon={<History size={24} />} title="No searches yet" description="Words you look up will appear here so you can revisit them instantly." action={<Link to="/dictionary" className="btn-primary">Search a word</Link>} />
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-white/5">
          {history.map((item) => (
            <Link key={`${item.word}-${item.searchedAt}`} to={`/word/${encodeURIComponent(item.word)}`} className="group flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><Clock3 size={17} /></span>
                <div className="min-w-0"><p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{item.word}</p><p className="truncate text-xs text-slate-400">{new Date(item.searchedAt).toLocaleString()}{item.definition ? ` · ${item.definition}` : ''}</p></div>
              </div>
              <ArrowRight size={17} className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
