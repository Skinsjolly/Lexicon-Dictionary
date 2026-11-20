import { useState } from 'react';
import { Check, Copy, Quote } from 'lucide-react';
import type { Definition } from '../types';
interface Props { definition: Definition; index: number }
export function DefinitionRow({ definition, index }: Props) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = [definition.definition, definition.example ? `Example: ${definition.example}` : ''].filter(Boolean).join('\n');
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { /* ignore */ }
  };
  return (
    <li className="group relative border-b border-slate-100 py-5 last:border-0 dark:border-white/5">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-7 text-slate-800 dark:text-slate-100">{definition.definition}</p>
          {definition.example ? <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/[0.035]"><Quote size={14} className="mt-1 shrink-0 text-slate-400" /><p className="text-sm italic leading-6 text-slate-600 dark:text-slate-300">{definition.example}</p></div> : null}
          {definition.synonyms.length > 0 ? <p className="mt-3 text-xs text-slate-500 dark:text-slate-400"><span className="font-semibold">Synonyms:</span> {definition.synonyms.slice(0, 5).join(', ')}</p> : null}
        </div>
        <button type="button" onClick={copy} title="Copy definition" aria-label="Copy definition" className="shrink-0 rounded-lg p-2 text-slate-300 opacity-0 transition hover:bg-brand-50 hover:text-brand-600 focus:opacity-100 group-hover:opacity-100 dark:text-slate-600">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
      </div>
    </li>
  );
}
