import { config } from '../../config.js';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompt.js';
import { extractJson, fetchJson, normalizeSentences } from './utils.js';

export const openAIProvider = {
  name: 'openai',
  label: 'OpenAI',

  async generate({ word, meanings }) {
    const base = (config.aiBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
    const payload = await fetchJson(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify({
        model: config.aiModel || 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt({ word, meanings }) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 700,
      }),
    });

    const content = payload?.choices?.[0]?.message?.content;
    return normalizeSentences(extractJson(content));
  },
};
