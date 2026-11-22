import { config } from '../../config.js';
import { WordNotFoundError, ProviderError } from '../../errors.js';
import { normalizeDictionaryEntry } from '../../utils/normalize.js';

const LICENSE = {
  name: 'CC BY-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-sa/4.0/',
};

const USER_AGENT = 'Lexicon-Dictionary/1.0 (https://ecosystem-dictionary.pages.dev)';

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
  ).replace(/\s+([,.;:!?])/g, '$1');
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
        .split(/[·•‧-]/)
        .map(cleanText)
        .filter(Boolean)
    : [];
  return { ipa, syllables };
}

export class WiktionaryDictionaryProvider {
  name = 'wiktionary';
  label = 'Wiktionary';

  async lookup(word) {
    const encoded = encodeURIComponent(word);
    const definitionUrl = `${config.wiktionaryBaseUrl}/api/rest_v1/page/definition/${encoded}`;
    const extractUrl = `${config.wiktionaryBaseUrl}/w/api.php?action=query&format=json&prop=extracts&explaintext=1&redirects=1&titles=${encoded}`;

    let definitionResponse;
    let extractResponse;
    try {
      [definitionResponse, extractResponse] = await Promise.all([
        fetch(definitionUrl, {
          headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
          signal: AbortSignal.timeout(15000),
        }),
        fetch(extractUrl, {
          headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
          signal: AbortSignal.timeout(15000),
        }).catch(() => null),
      ]);
    } catch {
      throw new ProviderError('Could not reach the fallback dictionary. Please try again shortly.');
    }

    if (definitionResponse.status === 404) throw new WordNotFoundError(word);
    if (!definitionResponse.ok) throw new ProviderError(`Fallback dictionary returned ${definitionResponse.status}.`);

    let definitionPayload;
    try {
      definitionPayload = await definitionResponse.json();
    } catch {
      throw new ProviderError('Fallback dictionary returned an invalid response.');
    }

    let extract = '';
    if (extractResponse?.ok) {
      try {
        const payload = await extractResponse.json();
        const page = Object.values(payload?.query?.pages || {})[0];
        extract = typeof page?.extract === 'string' ? page.extract : '';
      } catch {
        extract = '';
      }
    }

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
