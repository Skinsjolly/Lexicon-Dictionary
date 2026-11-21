import { Outlet } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Navbar } from './Navbar';
import { useTheme } from '../hooks/useTheme';
export function Layout() {
  const { theme, toggle } = useTheme();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar theme={theme} onToggleTheme={toggle} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-8 sm:px-6 sm:pt-12"><Outlet /></main>
      <footer className="border-t border-slate-200/70 py-8 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-400 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Lexicon. Built for curious minds.</p>
          <p className="flex items-center gap-1.5">Definitions by Free Dictionary API and Wiktionary <span>·</span> Made with <Heart size={11} className="fill-rose-400 text-rose-400" /></p>
        </div>
      </footer>
    </div>
  );
}
