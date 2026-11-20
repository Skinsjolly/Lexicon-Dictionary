import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
interface Props { theme: Theme; onToggle: () => void }
export function ThemeToggle({ theme, onToggle }: Props) {
  return <button type="button" onClick={onToggle} aria-label="Toggle theme" title="Toggle theme" className="btn-ghost h-10 w-10 !px-0">{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>;
}
