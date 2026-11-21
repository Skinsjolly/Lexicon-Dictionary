import { Moon, Sun, Trash2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useHistory, useSavedWords } from '../hooks/useLocalLists';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const history = useHistory();
  const saved = useSavedWords();

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-up">
      <div>
        <p className="label">Preferences</p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your local preferences and saved data.
        </p>
      </div>

      <section className="card p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <Moon size={18} className="text-brand-500" />
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Appearance & data</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Theme</p>
            <p className="text-xs text-slate-400">Your choice is remembered on this device.</p>
          </div>
          <div className="flex rounded-xl border border-slate-200 p-1 dark:border-white/10">
            {(['light', 'dark'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  theme === option
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {option === 'light' ? <Sun size={13} /> : <Moon size={13} />}
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-white/5">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">Local data</p>
            <p className="text-xs text-slate-400">
              {history.history.length} history items · {saved.saved.length} saved words
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all local history and saved words?')) {
                history.clear();
                saved.saved.forEach((item) => saved.remove(item.word));
              }
            }}
            className="btn-ghost !text-rose-600 dark:!text-rose-400"
          >
            <Trash2 size={14} /> Clear local data
          </button>
        </div>
      </section>
    </div>
  );
}
