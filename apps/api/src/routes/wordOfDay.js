import { Router } from 'express';
import { config } from '../config.js';
import { dictionaryCache } from '../cache.js';
import { getDictionaryProvider } from '../providers/dictionary/index.js';
import { pickWordOfTheDay } from '../utils/wordOfDay.js';
import { WordNotFoundError } from '../errors.js';
const router = Router();
router.get('/', async (req, res) => {
  const pick = pickWordOfTheDay();
  const provider = getDictionaryProvider();
  try {
    const { value } = await dictionaryCache.getOrLoad(`wotd:${provider.name}:${pick.word}`, config.dictionaryCacheTtl, () => provider.lookup(pick.word));
    return res.json({ date: new Date().toISOString().slice(0, 10), note: pick.note, entry: value });
  } catch (error) {
    if (error instanceof WordNotFoundError) {
      return res.json({ date: new Date().toISOString().slice(0, 10), note: pick.note, entry: { word: pick.word, phonetic: null, phonetics: [], audio: null, syllables: [], origin: null, meanings: [{ partOfSpeech: 'Noun', definitions: [{ definition: pick.note, example: null, synonyms: [], antonyms: [] }], synonyms: [], antonyms: [] }], synonyms: [], antonyms: [], sourceUrls: [], provider: 'curated' } });
    }
    return res.status(502).json({ error: 'provider_error', message: 'Could not load the word of the day.' });
  }
});
export default router;
