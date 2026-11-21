import { AlertCircle, Bot, Check, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { AIResult } from '../types';
import { Spinner } from './Spinner';
interface Props { result: AIResult | null; loading: boolean; word: string; onRetry?: () => void; compact?: boolean }
export function AISentenceCard({ result, loading, word, onRetry, compact = false }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const copy = async (text: string, index: number) => { try { await navigator.clipboard.writeText(text); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 1400); } catch { /* ignore */ } };
  void word;
  return (
    <section className={`ai-panel ${compact ? 'p-5' : 'p-6 sm:p-8'} animate-fade-up`}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-300/20 blur-3xl dark:bg-brand-500/10" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/25"><Bot size={19} /></span>
          <div>
            <div className="flex items-center gap-2"><h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">AI Sentence</h2><span className="rounded-full border border-brand-200 bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:border-brand-400/30 dark:bg-brand-500/10 dark:text-brand-300">AI</span></div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Original examples written for this meaning</p>
          </div>
        </div>
        {onRetry && result?.available === false && result.configured ? <button type="button" onClick={onRetry} className="btn-ghost !px-3 !py-2 !text-xs"><RefreshCw size={13} /> Retry</button> : null}
      </div>
      <div className="relative mt-5">
        {loading ? (
          <div className="space-y-3"><div className="skeleton h-5 w-11/12" /><div className="skeleton h-5 w-8/12" /><p className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-300"><Spinner size={13} /> Writing a fresh example…</p></div>
        ) : result?.available && result.sentences.length > 0 ? (
          <div className="space-y-3">
            {result.sentences.map((item, index) => (
              <div key={`${item.meaningIndex}-${index}`} className="group flex items-start justify-between gap-4 rounded-xl border border-white/70 bg-white/75 px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div><p className="font-display text-lg leading-8 text-slate-800 dark:text-slate-100">“{item.sentence}”</p>{item.partOfSpeech && !compact ? <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-300">{item.partOfSpeech}</p> : null}</div>
                <button type="button" onClick={() => copy(item.sentence, index)} title="Copy sentence" className="shrink-0 rounded-lg p-2 text-slate-300 transition hover:bg-brand-50 hover:text-brand-600 dark:text-slate-600">{copiedIndex === index ? <Check size={15} /> : <Copy size={15} />}</button>
              </div>
            ))}
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500"><Sparkles size={12} />AI-generated examples{result.cached ? ' · cached' : ''}</p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-brand-200 bg-white/60 px-5 py-4 dark:border-brand-400/20 dark:bg-white/[0.025]">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-500" />
            <div className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-white">AI sentences are unavailable</p>
              <p className="mt-0.5">AI examples are currently unavailable. The dictionary definitions above are still complete.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
