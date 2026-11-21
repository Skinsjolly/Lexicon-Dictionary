import { config } from '../../config.js';
import { WordNotFoundError, ProviderError } from '../../errors.js';
import { normalizeDictionaryEntry } from '../../utils/normalize.js';

const LICENSE = {
  name: 'CC BY-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-sa/4.0/',
};

const ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

function decodeEntities(text = '') {
  return String(text)
    .replace(/&(nbsp|amp|quot|apos|lt|gt);|&#39;|&#x([0-9a-f]+);|&#(\d+);/gi, (match, named, hex, decimal) => {
      if (named || match === '&#39;') return ENTITIES[match] ?? match;
      const point = hex ? parseInt(hex, 16) : parseInt(decimal, 10);
      try {
        return String.fromCodePoint(point);
      } catch {
        return match;
      }
    });
}

function cleanText(value = '') {
  return decodeEntities(String(value ?? ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(value = '') {
  return cleanText(
    String(value ?? '')
      .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
  );
}

function section(extract = '', heading = '') {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = extract.match(
    new RegExp(`={2,}\\s*${escaped}\\s*={2,}\\s*([\\s\\S]*?)(?=\\n={2,}|$)`, 'i')
  );
  return (match?.[1] || '').trim();
}

function relatedWords(extract, partOfSpeech, label) {
  const body = section(extract, partOfSpeech);
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = body.match(new RegExp(`${escaped}:\\s*([^\\n]+)`, 'i'));
  if (!match?.[1]) return [];
  return match[1]
    .split(',')
    .map((item) => cleanText(item.replace(/\[[^\]]*\]/g, '')))
    .filter(Boolean)
    .slice(0, 12);
}

function parsePronunciation(extract) {
  const pronunciation = section(extract, 'Pronunciation');
  const ipa = pronunciation.match(/IPA\([^)]*\)\s*:\s*(\/[^/\n]+\/)/i)?.[1] || null;
  const hyphenation = extract.match(/Hyphenation:\s*([^\n]+)/i)?.[1] || '';
  const syllables = hyphenation
    ? cleanText(hyphenation)
        .split(/[·•]/)
        .map(cleanText)
        .filter(Boolean)
    : [];
  return { ipa, syllables };
}

export class WiktionaryDictionaryProvider {
  name = 'wiktionary';
  label = 'Wiktionary';

  async lookup(word) {
    const base = config.dictionaryProxyUrl.replace(/\/$/, '');
    const url = config.dictionaryProxyUrl
      ? `${base}/api/wiktionary/${encodeURIComponent(word)}`
      : `${base}/api/rest_v1/page/definition/${encodeURIComponent(word)}`;

    let response;
    try {
      response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ProviderError('Could not reach the fallback dictionary. Please try again shortly.');
    }

    if (response.status === 404) throw new WordNotFoundError(word);
    if (!response.ok) throw new ProviderError(`Fallback dictionary returned ${response.status}.`);

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new ProviderError('Fallback dictionary returned an invalid response.');
    }

    const definitionPayload = payload?.definition ?? payload;
    const extract = typeof payload?.extract === 'string' ? payload.extract : '';
    const groups = Array.isArray(definitionPayload?.en) ? definitionPayload.en : [];

    const meanings = groups
      .map((group) => {
        const partOfSpeech = cleanText(group?.partOfSpeech) || 'Other';
        const definitions = (Array.isArray(group?.definitions) ? group.definitions : [])
          .map((item) => ({
            definition: stripHtml(item?.definition),
            example: stripHtml(item?.example) || null,
            synonyms: [],
            antonyms: [],
          }))
          .filter((item) => item.definition);

        return {
          partOfSpeech,
          definitions,
          synonyms: relatedWords(extract, partOfSpeech, 'Synonyms'),
          antonyms: relatedWords(extract, partOfSpeech, 'Antonyms'),
        };
      })
      .filter((meaning) => meaning.definitions.length > 0);

    if (!meanings.length) throw new WordNotFoundError(word);

    const { ipa, syllables } = parsePronunciation(extract);
    const origin = cleanText(section(extract, 'Etymology')) || null;

    const entry = normalizeDictionaryEntry(
      {
        word,
        phonetic: ipa,
        phonetics: ipa ? [{ text: ipa, audio: null }] : [],
        origin,
        meanings,
        sourceUrls: [`https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`],
        license: LICENSE,
      },
      this.name
    );

    if (!entry) throw new WordNotFoundError(word);
    if (syllables.length) entry.syllables = syllables;
    return entry;
  }

  async check() {
    await this.lookup('test');
    return true;
  }
}
