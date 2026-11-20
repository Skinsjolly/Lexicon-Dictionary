import { config } from '../config.js';
import { aiCache } from '../cache.js';
import { getAIProvider } from '../providers/ai/index.js';
const stem = (word = '') => String(word).toLowerCase().replace(/[^a-z]/g, '').slice(0, 5);
function cleanAndValidate(sentences, word, meanings) {
  const examples = meanings.map((m) => String(m.example || '').toLowerCase().trim()).filter(Boolean);
  const seen = new Set();
  return sentences.map((item) => {
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
    return { sentence: /[.!?]$/.test(sentence) ? sentence : `${sentence}.`, meaningIndex, partOfSpeech: meanings[meaningIndex]?.partOfSpeech || null };
  }).filter(Boolean).slice(0, 3);
}
export async function generateAISentences({ word, meanings = [] }) {
  const { provider, reason } = getAIProvider();
  if (!provider) return { available: false, configured: false, message: reason, sentences: [], provider: null, model: null };
  const normalizedWord = String(word || '').trim().toLowerCase();
  const rows = meanings.slice(0, 3);
  if (!rows.length) return { available: false, configured: true, message: 'No definitions were available to build an AI sentence.', sentences: [], provider: provider.name, model: config.aiModel || null };
  const key = `ai:${provider.name}:${config.aiModel || 'default'}:${normalizedWord}:${rows.map((r) => r.definition).join('|')}`;
  const cached = aiCache.get(key);
  if (cached) return { available: true, cached: true, sentences: cached, provider: provider.name, providerLabel: provider.label, model: config.aiModel || null };
  try {
    const raw = await provider.generate({ word: normalizedWord, meanings: rows });
    const sentences = cleanAndValidate(raw, normalizedWord, rows);
    if (!sentences.length) throw new Error('The AI provider returned no usable sentences.');
    aiCache.set(key, sentences, config.aiCacheTtl);
    return { available: true, cached: false, sentences, provider: provider.name, providerLabel: provider.label, model: config.aiModel || null };
  } catch (error) {
    return { available: false, configured: true, message: error?.message || 'AI sentence generation failed.', sentences: [], provider: provider.name, providerLabel: provider.label, model: config.aiModel || null };
  }
}
