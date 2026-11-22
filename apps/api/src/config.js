import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../../.env') });

const numberFrom = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  port: numberFrom(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  dictionaryProvider: (process.env.DICTIONARY_PROVIDER || 'free').trim().toLowerCase(),
  dictionaryCacheTtl: numberFrom(process.env.CACHE_TTL_DICTIONARY_MS || process.env.DICTIONARY_CACHE_TTL, 24 * 60 * 60 * 1000),
  dictionaryProxyUrl: (process.env.DICTIONARY_PROXY_URL || 'https://lexicon-dictionary-proxy.dalaverisnicholas.workers.dev').replace(/\/$/, ''),
  wiktionaryBaseUrl: (process.env.WIKTIONARY_BASE_URL || 'https://en.wiktionary.org').replace(/\/$/, ''),
  aiProvider: (process.env.AI_PROVIDER || '').trim().toLowerCase(),
  aiModel: (process.env.AI_MODEL || '').trim(),
  aiApiKey: (process.env.AI_API_KEY || '').trim(),
  aiBaseUrl: (process.env.AI_BASE_URL || '').trim(),
  aiCacheTtl: numberFrom(process.env.CACHE_TTL_AI_MS || process.env.AI_CACHE_TTL, 7 * 24 * 60 * 60 * 1000),
  suggestionLimit: numberFrom(process.env.SUGGESTION_LIMIT, 6),
  commercialDictionary: {
    baseUrl: (process.env.COMMERCIAL_DICTIONARY_BASE_URL || process.env.COMMERCIAL_DICTIONARY_API_URL || '').trim(),
    apiKey: (process.env.COMMERCIAL_DICTIONARY_API_KEY || '').trim(),
    label: (process.env.COMMERCIAL_DICTIONARY_LABEL || 'Commercial Dictionary').trim(),
  },
  version: process.env.APP_VERSION || '1.0.0',
};

export default config;
