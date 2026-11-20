import type { AIResult, AppConfig, DictionaryEntry, WordOfDay } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
  } catch {
    throw new ApiError('Could not reach Lexicon. Check your connection and try again.', 0);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload?.message || 'Something went wrong. Please try again.', response.status, payload?.error);
  }
  return payload as T;
}

export const api = {
  health: () => request<{ ok: boolean; service: string; version: string }>('/api/health'),
  config: () => request<AppConfig>('/api/config'),
  providerStatus: () =>
    request<{ dictionary: string; ai: string; aiReason: string | null; checkedAt: string }>('/api/health/providers'),
  suggestions: (query: string) =>
    request<{ suggestions: string[] }>(`/api/suggestions?q=${encodeURIComponent(query)}`),
  dictionary: (word: string) => request<DictionaryEntry>(`/api/dictionary/${encodeURIComponent(word)}`),
  wordOfTheDay: () => request<WordOfDay>('/api/word-of-the-day'),
  aiSentence: (word: string, meanings: { partOfSpeech: string; definition: string; example: string | null }[]) =>
    request<AIResult>('/api/ai/sentence', {
      method: 'POST',
      body: JSON.stringify({ word, meanings }),
    }),
};

const aiResultCache = new Map<string, AIResult>();
const aiKey = (word: string, meanings: { definition: string }[]) =>
  `${word.trim().toLowerCase()}:${meanings.map((item) => item.definition).join('|')}`;

export async function getCachedAISentence(
  word: string,
  meanings: { partOfSpeech: string; definition: string; example: string | null }[],
) {
  const key = aiKey(word, meanings);
  const cached = aiResultCache.get(key);
  if (cached) return cached;
  const result = await api.aiSentence(word, meanings);
  aiResultCache.set(key, result);
  return result;
}

export function clearCachedAISentence(
  word: string,
  meanings: { partOfSpeech: string; definition: string; example: string | null }[],
) {
  aiResultCache.delete(aiKey(word, meanings));
}
