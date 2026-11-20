import { useEffect, useState } from 'react';
import { getStoredTheme, setStoredTheme } from '../lib/storage';
export type Theme = 'light' | 'dark';
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => { const stored = getStoredTheme(); if (stored === 'light' || stored === 'dark') return stored; return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; });
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); setStoredTheme(theme); }, [theme]);
  const toggle = () => setTheme((c) => (c === 'dark' ? 'light' : 'dark'));
  return { theme, setTheme, toggle };
}
