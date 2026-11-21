import { config } from '../../config.js';
import { fetchJson, normalizeSentences } from './utils.js';

const DEFAULT_BASE_URL = 'https://ecosystem-backend-l1qf.onrender.com';

/**
 * Uses the ecosystem backend's Gemini configuration instead of requiring a
 * separate Gemini key in Lexicon. `AI_API_KEY` carries the shared token that
 * the ecosystem backend expects in the `x-lexicon-token` header.
 */
export const ecosystemProvider = {
  name: 'ecosystem',
  label: 'Ecosystem Gemini',

  async generate({ word, meanings }) {
    const base = (config.aiBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    const payload = await fetchJson(`${base}/api/search/dictionary-sentence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lexicon-token': config.aiApiKey,
      },
      body: JSON.stringify({ word, meanings }),
    });
    return normalizeSentences(payload);
  },
};
