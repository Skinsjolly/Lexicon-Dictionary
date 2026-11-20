import { DefinitionRow } from './DefinitionRow';
import type { Meaning } from '../types';
interface Props { meaning: Meaning }
export function MeaningSection({ meaning }: Props) {
  return (
    <section className="card p-6 sm:p-8 animate-fade-up">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{meaning.partOfSpeech}</h2>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">{meaning.definitions.length} {meaning.definitions.length === 1 ? 'definition' : 'definitions'}</span>
      </div>
      <ol>{meaning.definitions.map((definition, index) => <DefinitionRow key={`${definition.definition}-${index}`} definition={definition} index={index} />)}</ol>
      {meaning.antonyms.length > 0 ? <p className="mt-4 text-xs text-slate-500 dark:text-slate-400"><span className="font-semibold">Antonyms:</span> {meaning.antonyms.slice(0, 5).join(', ')}</p> : null}
    </section>
  );
}
