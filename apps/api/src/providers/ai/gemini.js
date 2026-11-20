import { config } from '../../config.js';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompt.js';
import { extractJson, fetchJson, normalizeSentences } from './utils.js';

export const geminiProvider = {
  name: 'gemini',
  label: 'Google Gemini',

  async generate({ word, meanings }) {
    const model = config.aiModel || 'gemini-2.0-flash';
    const base = (config.aiBaseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
    const url = `${base}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.aiApiKey)}`;

    const payload = await fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPrompt({ word, meanings }) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.5, maxOutputTokens: 700 },
      }),
    });

    const content = payload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('');
    return normalizeSentences(extractJson(content));
  },
};
