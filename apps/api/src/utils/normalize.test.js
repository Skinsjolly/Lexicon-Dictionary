import test from 'node:test';
import assert from 'node:assert/strict';
import { extractWord, normalizeDictionaryEntry } from './normalize.js';

test('extracts a word from natural language queries', () => {
  assert.equal(extractWord('What does "Grass" mean'), 'grass');
  assert.equal(extractWord('define resilient'), 'resilient');
  assert.equal(extractWord('  Ambitious!  '), 'ambitious');
});

test('normalizes Free Dictionary API payloads', () => {
  const entry = normalizeDictionaryEntry(
    [
      {
        word: 'ambitious',
        phonetic: '/æmˈbɪʃ.əs/',
        phonetics: [{ text: '/æmˈbɪʃ.əs/', audio: 'https://example.com/ambitious.mp3' }],
        meanings: [
          {
            partOfSpeech: 'adjective',
            definitions: [{ definition: 'Having ambition.', example: 'an ambitious person' }],
          },
        ],
        sourceUrls: ['https://en.wiktionary.org/wiki/ambitious'],
      },
    ],
    'free',
  );

  assert.equal(entry.word, 'ambitious');
  assert.equal(entry.phonetic, '/æmˈbɪʃ.əs/');
  assert.equal(entry.audio, 'https://example.com/ambitious.mp3');
  assert.deepEqual(entry.syllables, ['æmbɪʃ', 'əs']);
  assert.equal(entry.meanings[0].partOfSpeech, 'Adjective');
  assert.equal(entry.meanings[0].definitions[0].example, 'an ambitious person');
});
