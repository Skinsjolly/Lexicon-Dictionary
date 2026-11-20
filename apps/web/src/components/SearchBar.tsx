import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock3, Search, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { getHistory } from '../lib/storage';
import { Spinner } from './Spinner';

interface Props {
  initialValue?: string;
  placeholder?: string;
  variant?: 'hero' | 'compact';
  autoFocus?: boolean;
  onSearched?: (word: string) => void;
}

export function SearchBar({
  initialValue = '',
  placeholder = 'Search any English word…',
  variant = 'hero',
  autoFocus = false,
  onSearched,
}: Props) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setValue(initialValue), [initialValue]);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .suggestions(query)
        .then((data) => setSuggestions(data.suggestions.slice(0, 5)))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(timer);
  }, [value]);

  const recent = getHistory()
    .slice(0, 3)
    .map((item) => item.word)
    .filter((word) => word.toLowerCase().includes(value.trim().toLowerCase()));

  const options = [...new Set([...recent, ...suggestions])].slice(0, 6);

  const go = (word: string) => {
    const clean = word.trim();
    if (!clean) return;
    setOpen(false);
    setActive(-1);
    onSearched?.(clean);
    navigate(`/word/${encodeURIComponent(clean)}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && options.length) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % options.length);
    } else if (event.key === 'ArrowUp' && options.length) {
      event.preventDefault();
      setActive((index) => (index <= 0 ? options.length - 1 : index - 1));
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(active >= 0 && options[active] ? options[active] : value);
    }
  };

  const hero = variant === 'hero';

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          go(value);
        }}
        className={hero ? 'flex flex-col gap-3 sm:flex-row' : 'relative'}
      >
        <div className="relative flex-1">
          <Search
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 ${hero ? 'h-5 w-5' : 'h-4 w-4'}`}
          />
          <input
            className={`${hero ? 'input !py-5 !pl-12 !pr-5 text-lg' : 'input !py-3 !pl-10 !pr-4 !text-sm'}`}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label="Search for a word"
            aria-autocomplete="list"
            aria-expanded={open && options.length > 0}
          />
          {loading ? (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-500">
              <Spinner size={16} />
            </span>
          ) : null}
        </div>
        <button type="submit" className={`${hero ? 'btn-primary !px-7 !py-5 text-base' : 'absolute right-2 top-1/2 -translate-y-1/2 !rounded-lg !px-3 !py-2'}`}>
          {hero ? (
            <>
              Search <ArrowRight size={18} />
            </>
          ) : (
            <ArrowRight size={16} />
          )}
        </button>
      </form>

      {open && options.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lift dark:border-white/10 dark:bg-[#151922]">
          <p className="label px-3 py-2">Suggestions</p>
          {options.map((option, index) => {
            const isRecent = recent.includes(option);
            return (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => go(option)}
                onMouseEnter={() => setActive(index)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active === index
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5 font-medium">
                  {isRecent ? <Clock3 size={14} className="text-slate-400" /> : <Sparkles size={14} className="text-brand-400" />}
                  {option}
                </span>
                <ArrowRight size={14} className="opacity-40" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
