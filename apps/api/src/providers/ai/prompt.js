export const SYSTEM_PROMPT = `You write concise, natural example sentences for a dictionary website.
Rules:
- Return ONLY valid JSON with this shape: {"sentences":[{"meaningIndex":0,"sentence":"..."}]}
- Write one sentence for each requested meaning, in the same order.
- Use the exact headword naturally and clearly.
- Respect the part of speech for that meaning.
- Use everyday vocabulary and correct grammar.
- Do not copy or closely paraphrase any provided traditional example.
- Make each sentence demonstrate the specific meaning, not just contain the word.
- No markdown, no commentary, no word definitions.`;
export function buildUserPrompt({ word, meanings }) {
  const rows = meanings.slice(0, 3).map((meaning, index) => ({ meaningIndex: index, partOfSpeech: meaning.partOfSpeech || 'unknown', definition: meaning.definition || '', traditionalExample: meaning.example || null }));
  return JSON.stringify({ word, meanings: rows, instructions: 'Return one original sentence per meaningIndex. Avoid the traditionalExample values.' }, null, 2);
}
