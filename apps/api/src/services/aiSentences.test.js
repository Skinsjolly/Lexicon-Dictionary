import test from 'node:test';
import assert from 'node:assert/strict';
import { toAiMeaningRows } from './aiSentences.js';

test('flattens dictionary meanings into AI provider rows', () => {
  const rows = toAiMeaningRows([
    {
      partOfSpeech: 'Noun',
      definitions: [
        { definition: 'The phenomenon of platforms degrading.', example: 'Enshittification spread quickly.' },
      ],
    },
    { partOfSpeech: 'Verb', definitions: [{ definition: '' }] },
  ]);

  assert.deepEqual(rows, [
    {
      partOfSpeech: 'Noun',
      definition: 'The phenomenon of platforms degrading.',
      example: 'Enshittification spread quickly.',
    },
  ]);
});
