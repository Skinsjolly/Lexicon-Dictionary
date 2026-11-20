/** Extract a single dictionary word from free-form search text. */
export function extractWord(input = '') {
  const text = String(input).trim().toLowerCase();
  if (!text) return '';

  const patterns = [
    /what does\s+["“'‘]?\s*([a-z][a-z'’-]*)\s*["”'’]?\s+mean\b/,
    /what is the meaning of\s+([a-z][a-z'’-]*)\b/,
    /(?:define|definition of|meaning of)\s+([a-z][a-z'’-]*)\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanWord(match[1]);
  }

  const first = text.match(/[a-z][a-z'’-]*/)?.[0] || '';
  return cleanWord(first);
}

export function cleanWord(input = '') {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}]+/u, '')
    .replace(/[^\p{L}'’-]+$/u, '');
}

export function titleCase(value = '') {
  return String(value || '')
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function capitalize(value = '') {
  const text = String(value || '').trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : 'Other';
}

function deriveSyllables(phonetic = '') {
  if (!phonetic) return [];
  const cleaned = phonetic.replace(/^\/|\/$/g, '').replace(/[ˈˌ]/g, '');
  if (!/[.·]/.test(cleaned)) return [];
  return cleaned
    .split(/[.·]/)
    .map((part) => part.replace(/[\sˈˌ]/g, '').trim())
    .filter(Boolean);
}

/** Convert any provider payload into the one shape the frontend consumes. */
export function normalizeDictionaryEntry(raw, provider = 'free') {
  const source = Array.isArray(raw) ? raw[0] : raw;
  if (!source || typeof source !== 'object') return null;

  const phonetics = Array.isArray(source.phonetics)
    ? source.phonetics
        .map((item) => ({
          text: typeof item?.text === 'string' && item.text.trim() ? item.text.trim() : null,
          audio: typeof item?.audio === 'string' && item.audio.trim() ? item.audio.trim() : null,
          sourceUrl: item?.sourceUrl || null,
          license: item?.license || null,
        }))
        .filter((item) => item.text || item.audio)
    : [];

  const phonetic = source.phonetic || phonetics.find((item) => item.text)?.text || null;

  const meanings = Array.isArray(source.meanings)
    ? source.meanings
        .map((meaning) => {
          const definitions = Array.isArray(meaning?.definitions)
            ? meaning.definitions
                .map((definition) => ({
                  definition: String(definition?.definition || definition?.text || '').trim(),
                  example: typeof definition?.example === 'string' ? definition.example.trim() : null,
                  synonyms: Array.isArray(definition?.synonyms) ? definition.synonyms : [],
                  antonyms: Array.isArray(definition?.antonyms) ? definition.antonyms : [],
                }))
                .filter((definition) => definition.definition)
            : [];

          return {
            partOfSpeech: capitalize(meaning?.partOfSpeech || 'other'),
            definitions,
            synonyms: Array.isArray(meaning?.synonyms) ? meaning.synonyms : [],
            antonyms: Array.isArray(meaning?.antonyms) ? meaning.antonyms : [],
          };
        })
        .filter((meaning) => meaning.definitions.length > 0)
    : [];

  if (!meanings.length) return null;

  return {
    word: String(source.word || '').trim().toLowerCase(),
    phonetic,
    phonetics,
    audio: phonetics.find((item) => item.audio)?.audio || null,
    syllables: deriveSyllables(phonetic || ''),
    origin: source.origin || source.etymology || null,
    meanings,
    synonyms: [...new Set(meanings.flatMap((meaning) => meaning.synonyms))].slice(0, 12),
    antonyms: [...new Set(meanings.flatMap((meaning) => meaning.antonyms))].slice(0, 12),
    sourceUrls: Array.isArray(source.sourceUrls) ? source.sourceUrls : [],
    license: source.license || null,
    provider,
    fetchedAt: new Date().toISOString(),
  };
}

/** Flat meaning list used by the AI prompt and search Definition tab. */
export function flattenMeanings(entry) {
  const rows = [];
  for (const meaning of entry?.meanings || []) {
    for (const definition of meaning.definitions || []) {
      rows.push({
        partOfSpeech: meaning.partOfSpeech,
        definition: definition.definition,
        example: definition.example || null,
      });
    }
  }
  return rows;
}
