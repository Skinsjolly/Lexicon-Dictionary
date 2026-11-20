import { config } from '../../config.js';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompt.js';
import { extractJson, fetchJson, normalizeSentences } from './utils.js';

export const anthropicProvider = {
  name: 'anthropic',
  label: 'Anthropic',

  async generate({ word, meanings }) {
    const base = (config.aiBaseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '');
    const payload = await fetchJson(`${base}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.aiApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.aiModel || 'claude-3-5-haiku-latest',
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt({ word, meanings }) }],
      }),
    });

    const content = payload?.content?.find((part) => part?.type === 'text')?.text;
    return normalizeSentences(extractJson(content));
  },
};
