import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BookMarked, BookOpenText, History, Home, Menu, Settings, Sparkles, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../hooks/useTheme';
const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/dictionary', label: 'Dictionary', icon: BookOpenText, end: false },
  { to: '/word-of-the-day', label: 'Word of the Day', icon: Sparkles, end: false },
  { to: '/history', label: 'History', icon: History, end: false },
  { to: '/saved', label: 'Saved', icon: BookMarked, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];
interface Props { theme: Theme; onToggleTheme: () => void }
export function Navbar({ theme, onToggleTheme }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0d0f14]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-transform group-hover:-rotate-6">L</span>
          <span className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">lexicon<span className="text-brand-500">.</span></span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'}`}><Icon size={14} />{label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button type="button" className="btn-ghost h-10 w-10 !px-0 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation">{open ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-slate-200/70 bg-white px-4 py-3 lg:hidden dark:border-white/10 dark:bg-[#0d0f14]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-1.5">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'}`}><Icon size={15} />{label}</NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
