import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const listPath = path.resolve(here, '../../data/common-words.txt');

const COMMON_WORDS = fs
  .readFileSync(listPath, 'utf8')
  .split(/\r?\n/)
  .map((word) => word.trim().toLowerCase())
  .filter((word) => /^[a-z][a-z'-]*$/.test(word));

const known = new Set(COMMON_WORDS);

export function rememberWord(word) {
  const clean = String(word || '').trim().toLowerCase();
  if (/^[a-z][a-z'-]*$/.test(clean) && !known.has(clean)) {
    known.add(clean);
    COMMON_WORDS.push(clean);
  }
}

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function suggestWords(query = '', limit = 6) {
  const prefix = String(query).trim().toLowerCase();
  if (!prefix) return COMMON_WORDS.slice(0, limit);

  const scored = [];
  for (const word of known) {
    let score = 99;
    if (word.startsWith(prefix)) score = 0 + (word.length - prefix.length) * 0.01;
    else if (word.includes(prefix)) score = 10 + word.indexOf(prefix) * 0.01;
    else if (prefix.length >= 4 && editDistance(word, prefix) <= 2) score = 20 + editDistance(word, prefix);

    if (score < 99) scored.push({ word, score });
  }

  return scored
    .sort((a, b) => a.score - b.score || a.word.localeCompare(b.word))
    .slice(0, limit)
    .map((item) => item.word);
}
