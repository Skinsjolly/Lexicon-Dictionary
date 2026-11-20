import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenText, Bot, Bookmark, Sparkles, WandSparkles } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { WordCard } from '../components/WordCard';
import { api } from '../lib/api';
import { getHistory } from '../lib/storage';
import type { WordOfDay } from '../types';
const suggestions = ['ambitious', 'resilient', 'serendipity', 'luminous', 'grass'];
export function HomePage() {
  const [wotd, setWotd] = useState<WordOfDay | null>(null);
  const [recent] = useState(getHistory().slice(0, 4));
  useEffect(() => { api.wordOfTheDay().then(setWotd).catch(() => undefined); }, []);
  return (
    <div className="space-y-16">
      <section className="relative mx-auto max-w-4xl pt-6 text-center animate-fade-up">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-300"><WandSparkles size={14} /> Definitions, clarified. Examples, reimagined.</div>
        <h1 className="text-balance font-display text-5xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-7xl dark:text-white">Look closer.<br /><span className="bg-gradient-to-r from-brand-600 to-mint-600 bg-clip-text text-transparent dark:from-brand-300 dark:to-mint-400">Speak clearer.</span></h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-7 text-slate-500 sm:text-lg dark:text-slate-400">A modern dictionary with clean definitions, pronunciation, and original AI-written sentences that show words in real life.</p>
        <div className="mx-auto mt-10 max-w-3xl text-left"><SearchBar /></div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm"><span className="text-slate-400">Try:</span>{suggestions.map((word) => <Link key={word} to={`/word/${word}`} className="chip">{word}</Link>)}</div>
      </section>
      {recent.length > 0 ? (
        <section className="mx-auto max-w-4xl animate-fade-up">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Recent searches</h2><Link to="/history" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">View all <ArrowRight size={13} /></Link></div>
          <div className="flex flex-wrap gap-2">{recent.map((item) => <Link key={item.word} to={`/word/${encodeURIComponent(item.word)}`} className="chip">{item.word}</Link>)}</div>
        </section>
      ) : null}
      {wotd ? (
        <section className="mx-auto max-w-4xl animate-fade-up">
          <div className="mb-5 flex items-center justify-between"><div><p className="label">Curated for today</p><h2 className="mt-1 font-display text-2xl font-semibold text-slate-900 dark:text-white">Word of the Day</h2></div><Link to="/word-of-the-day" className="btn-ghost !px-3 !py-2 !text-xs">Open <ArrowRight size={13} /></Link></div>
          <WordCard entry={wotd.entry} note={wotd.note} />
        </section>
      ) : null}
      <section className="grid gap-4 sm:grid-cols-3">
        {[{ icon: BookOpenText, title: 'Organized meanings', text: 'Definitions grouped by part of speech, numbered and easy to scan.', tone: 'from-brand-500 to-brand-600' }, { icon: Bot, title: 'Original AI sentences', text: 'Fresh examples written for the exact meaning — never copied from the dictionary.', tone: 'from-violet-500 to-brand-600' }, { icon: Bookmark, title: 'Your vocabulary', text: 'Save words and revisit your search history from anywhere in the app.', tone: 'from-mint-500 to-emerald-600' }].map(({ icon: Icon, title, text, tone }) => (
          <div key={title} className="card p-6"><span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-lg`}><Icon size={18} /></span><h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p></div>
        ))}
      </section>
      <section className="card flex flex-col items-center gap-4 bg-gradient-to-r from-brand-600 to-indigo-700 p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
        <div><h2 className="flex items-center gap-2 font-display text-2xl font-semibold"><Sparkles size={20} /> Ready to expand your vocabulary?</h2><p className="mt-1 text-sm text-indigo-100">Start with any word. The rest is one search away.</p></div>
        <Link to="/dictionary" className="btn !bg-white !text-brand-700 hover:!bg-indigo-50">Open dictionary <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}
