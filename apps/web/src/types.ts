export interface Phonetic {
  text: string | null;
  audio: string | null;
  sourceUrl?: string | null;
  license?: unknown;
}

export interface Definition {
  definition: string;
  example: string | null;
  synonyms: string[];
  antonyms: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic: string | null;
  phonetics: Phonetic[];
  audio: string | null;
  syllables: string[];
  origin: string | null;
  meanings: Meaning[];
  synonyms: string[];
  antonyms: string[];
  sourceUrls: string[];
  license?: unknown;
  provider: string;
  fetchedAt?: string;
  cached?: boolean;
}

export interface AISentence {
  sentence: string;
  meaningIndex: number;
  partOfSpeech: string | null;
}

export interface AIResult {
  available: boolean;
  configured: boolean;
  cached?: boolean;
  message?: string | null;
  sentences: AISentence[];
  provider?: string | null;
  providerLabel?: string | null;
  model?: string | null;
}

export interface AppConfig {
  version: string;
  dictionary: { provider: string; label: string; configured: boolean };
  ai: {
    provider: string | null;
    label: string | null;
    model: string | null;
    configured: boolean;
    reason: string | null;
  };
  features: { audio: boolean; suggestions: boolean; aiSentences: boolean };
}

export interface WordOfDay {
  date: string;
  note: string;
  entry: DictionaryEntry;
}

export interface HistoryItem {
  word: string;
  definition: string | null;
  searchedAt: string;
}

export interface SavedWord {
  word: string;
  definition: string | null;
  phonetic: string | null;
  savedAt: string;
}
