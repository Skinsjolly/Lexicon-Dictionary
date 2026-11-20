import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestWords } from './suggestions.js';

test('suggests words by prefix', () => {
  const suggestions = suggestWords('gra');
  assert.ok(suggestions.length > 0);
  assert.ok(suggestions.includes('grass'));
  assert.ok(suggestions.every((word) => typeof word === 'string'));
});

test('returns empty list for nonsense', () => {
  assert.deepEqual(suggestWords('zzzqqqxx'), []);
});
