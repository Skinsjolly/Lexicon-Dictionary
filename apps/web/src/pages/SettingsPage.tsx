import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, KeyRound, Moon, ServerCog, Settings2, Sun, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useTheme } from '../hooks/useTheme';
import { Spinner } from '../components/Spinner';
import { useHistory, useSavedWords } from '../hooks/useLocalLists';
import type { AppConfig } from '../types';

interface ProviderStatus {
  dictionary: string;
  ai: string;
  aiReason: string | null;
  checkedAt: string;
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        ok
          ? 'bg-mint-50 text-mint-700 dark:bg-mint-500/10 dark:text-mint-400'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
      }`}
    >
      {ok ? <CheckCircle2 size={12} /> : <CircleAlert size={12} />}
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-white/5">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  );
}

export function SettingsPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const { theme, setTheme } = useTheme();
  const history = useHistory();
  const saved = useSavedWords();

  useEffect(() => {
    api.config().then(setConfig).catch(() => undefined);
    api.providerStatus().then(setStatus).catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-up">
      <div>
        <p className="label">Configuration</p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Provider details, connection status, and your local preferences.
        </p>
      </div>

      <section className="card p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <ServerCog size={18} className="text-brand-500" />
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">API providers</h2>
        </div>
        {!config ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
            <Spinner /> Loading configuration…
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-5 dark:border-white/5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Dictionary</h3>
                <StatusBadge ok={status?.dictionary === 'ok'} label={status?.dictionary || 'checking'} />
              </div>
              <Row label="Provider" value={config.dictionary.label} />
              <Row label="Key" value={<code className="text-xs">{config.dictionary.provider}</code>} />
              <Row label="Definition cache" value="24 hours" />
            </div>

            <div className="rounded-2xl border border-slate-100 p-5 dark:border-white/5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI sentences</h3>
                <StatusBadge ok={config.ai.configured} label={config.ai.configured ? 'connected' : 'not configured'} />
              </div>
              <Row label="Provider" value={config.ai.label || 'None'} />
              <Row label="Model" value={config.ai.model ? <code className="text-xs">{config.ai.model}</code> : '—'} />
              <Row label="Cache" value="7 days" />
              {config.ai.reason ? (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  {config.ai.reason}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <section className="card p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 size={18} className="text-brand-500" />
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Environment variables</h2>
        </div>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          Provider settings live on the server. API keys are never sent to the browser. Copy <code>.env.example</code> to{' '}
          <code>.env</code> on your backend host and set the values you need.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-slate-200 dark:bg-black/40">
{`DICTIONARY_PROVIDER=free
# Future: DICTIONARY_PROVIDER=commercial
# COMMERCIAL_DICTIONARY_BASE_URL=https://...
# COMMERCIAL_DICTIONARY_API_KEY=...

AI_PROVIDER=openai        # openai | anthropic | gemini
AI_MODEL=gpt-4.1-mini
AI_API_KEY=your_server_side_key`}
        </pre>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <KeyRound size={13} /> Changing these requires a backend redeploy. No code changes needed.
        </p>
      </section>

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
