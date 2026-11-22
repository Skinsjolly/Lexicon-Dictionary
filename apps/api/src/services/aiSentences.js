import { config } from '../config.js';
import { aiCache } from '../cache.js';
import { getAIProvider } from '../providers/ai/index.js';

const stem = (word = '') => String(word).toLowerCase().replace(/[^a-z]/g, '').slice(0, 5);

/** Dictionary entries nest definitions; AI providers expect one flat definition per meaning. */
export function toAiMeaningRows(meanings = []) {
  return meanings
    .slice(0, 3)
    .map((meaning) => {
      const first = Array.isArray(meaning?.definitions) ? meaning.definitions[0] || {} : {};
      return {
        partOfSpeech: meaning?.partOfSpeech || null,
        definition: String(meaning?.definition || first.definition || '').trim(),
        example: String(meaning?.example || first.example || '').trim() || null,
      };
    })
    .filter((row) => row.definition);
}

function cleanAndValidate(sentences, word, meanings) {
  const examples = meanings.map((m) => String(m.example || '').toLowerCase().trim()).filter(Boolean);
  const seen = new Set();
  return sentences
    .map((item) => {
      let sentence = String(item.sentence || '').replace(/\s+/g, ' ').trim();
      sentence = sentence.replace(/^[-*\d.)\s]+/, '');
      if (!sentence || sentence.length < 12 || sentence.length > 320) return null;
      const lower = sentence.toLowerCase();
      const head = stem(word);
      if (head && !lower.includes(head) && !lower.includes(word.toLowerCase())) return null;
      if (examples.some((e) => lower === e || lower.includes(e))) return null;
      if (seen.has(lower)) return null;
      seen.add(lower);
      const meaningIndex = Math.min(item.meaningIndex || 0, Math.max(meanings.length - 1, 0));
      return {
        sentence: /[.!?]$/.test(sentence) ? sentence : `${sentence}.`,
        meaningIndex,
        partOfSpeech: meanings[meaningIndex]?.partOfSpeech || null,
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

/**
 * Returns only user-safe fields. Provider names, models, env hints, and raw
 * upstream errors stay server-side and are never sent to the browser.
 */
export async function generateAISentences({ word, meanings = [] }) {
  const { provider } = getAIProvider();
  if (!provider) {
    return { available: false, configured: false, message: 'AI sentences are not available.', sentences: [] };
  }

  const normalizedWord = String(word || '').trim().toLowerCase();
  const rows = toAiMeaningRows(meanings);
  if (!rows.length) {
    return {
      available: false,
      configured: true,
      message: 'No definitions were available to build an example.',
      sentences: [],
    };
  }

  const key = `ai:${provider.name}:${config.aiModel || 'default'}:${normalizedWord}:${rows
    .map((row) => row.definition)
    .join('|')}`;
  const cached = aiCache.get(key);
  if (cached) return { available: true, cached: true, sentences: cached };

  try {
    const raw = await provider.generate({ word: normalizedWord, meanings: rows });
    const sentences = cleanAndValidate(raw, normalizedWord, rows);
    if (!sentences.length) throw new Error('AI provider returned no usable sentences.');
    aiCache.set(key, sentences, config.aiCacheTtl);
    return { available: true, cached: false, sentences };
  } catch (error) {
    console.error('AI sentence generation failed:', error);
    return {
      available: false,
      configured: true,
      message: 'AI sentences are currently unavailable.',
      sentences: [],
    };
  }
}
