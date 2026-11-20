export function extractJson(text = '') {
  if (typeof text !== 'string') throw new Error('AI provider returned no text.');
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced ? fenced[1] : text;
  const start = source.search(/[[{]/);
  const end = Math.max(source.lastIndexOf('}'), source.lastIndexOf(']'));
  if (start === -1 || end === -1) throw new Error('AI provider did not return JSON.');
  return JSON.parse(source.slice(start, end + 1));
}

export function normalizeSentences(parsed) {
  const list = Array.isArray(parsed) ? parsed : parsed?.sentences;
  if (!Array.isArray(list)) return [];

  return list
    .map((item, fallbackIndex) => {
      const sentence = typeof item === 'string' ? item : item?.sentence;
      if (typeof sentence !== 'string') return null;
      const meaningIndex =
        Number.isInteger(item?.meaningIndex) && item.meaningIndex >= 0 ? item.meaningIndex : fallbackIndex;
      return { meaningIndex, sentence: sentence.trim().replace(/^["'“”]|["'“”]$/g, '') };
    })
    .filter(Boolean);
}

export async function fetchJson(url, options) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  const text = await response.text();
  if (!response.ok) {
    let detail = text.slice(0, 300);
    try {
      const parsed = JSON.parse(text);
      detail = parsed?.error?.message || parsed?.message || detail;
    } catch {
      /* keep raw detail */
    }
    throw new Error(`AI provider returned ${response.status}: ${detail}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('AI provider returned invalid JSON.');
  }
}
