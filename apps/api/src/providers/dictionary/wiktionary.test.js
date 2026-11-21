import test from 'node:test';
import assert from 'node:assert/strict';
import { WiktionaryDictionaryProvider } from './wiktionary.js';

test('normalizes a Wiktionary fallback entry', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    status: 200,
    ok: true,
    json: async () => ({
      definition: {
        en: [
          {
            partOfSpeech: 'Noun',
            definitions: [
              { definition: '<style>.x{}</style><span>The phenomenon</span> of online platforms.' },
            ],
          },
        ],
      },
      extract: [
        '== English ==',
        '=== Pronunciation ===',
        'IPA(key): /ɪnˌʃɪtɪfɪˈkeɪʃən/',
        'Hyphenation: en·shit·i·fi·ca·tion',
        '=== Noun ===',
        'The phenomenon of online platforms.',
        'Synonyms: crapification, enshittening',
        'Antonyms: deshittification',
        '=== Etymology ===',
        'From en + shit + -ification.',
      ].join('\n'),
    }),
  });

  try {
    const entry = await new WiktionaryDictionaryProvider().lookup('enshittification');
    assert.equal(entry.provider, 'wiktionary');
    assert.equal(entry.phonetic, '/ɪnˌʃɪtɪfɪˈkeɪʃən/');
    assert.deepEqual(entry.syllables, ['en', 'shit', 'i', 'fi', 'ca', 'tion']);
    assert.equal(entry.meanings[0].definitions[0].definition, 'The phenomenon of online platforms.');
    assert.deepEqual(entry.meanings[0].synonyms, ['crapification', 'enshittening']);
    assert.deepEqual(entry.meanings[0].antonyms, ['deshittification']);
    assert.equal(entry.origin, 'From en + shit + -ification.');
  } finally {
    global.fetch = originalFetch;
  }
});
