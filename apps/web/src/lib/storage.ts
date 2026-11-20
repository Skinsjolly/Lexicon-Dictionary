import type { HistoryItem, SavedWord } from '../types';
const KEYS = { history: 'lexicon:history', saved: 'lexicon:saved', theme: 'lexicon:theme' };
function read<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function write<T>(key: string, value: T) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } }
export function getHistory() { return read<HistoryItem[]>(KEYS.history, []); }
export function addHistory(item: HistoryItem) { const next = [item, ...getHistory().filter((e) => e.word !== item.word)].slice(0, 40); write(KEYS.history, next); return next; }
export function clearHistory() { write(KEYS.history, []); }
export function getSavedWords() { return read<SavedWord[]>(KEYS.saved, []); }
export function saveWord(item: SavedWord) { const current = getSavedWords(); if (current.some((e) => e.word === item.word)) return current; const next = [item, ...current].slice(0, 100); write(KEYS.saved, next); return next; }
export function removeSavedWord(word: string) { const next = getSavedWords().filter((e) => e.word !== word); write(KEYS.saved, next); return next; }
export function getStoredTheme() { return localStorage.getItem(KEYS.theme); }
export function setStoredTheme(theme: string) { localStorage.setItem(KEYS.theme, theme); }
