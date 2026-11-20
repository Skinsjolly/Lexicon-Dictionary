import { Router } from 'express';
import { config } from '../config.js';
import { dictionaryCache } from '../cache.js';
import { getDictionaryProvider } from '../providers/dictionary/index.js';
import { extractWord } from '../utils/normalize.js';
import { suggestWords } from '../utils/suggestions.js';
import { WordNotFoundError } from '../errors.js';

const router = Router();

router.get('/:word', async (req, res, next) => {
  const word = extractWord(req.params.word);
  if (!word) return res.status(400).json({ error: 'invalid_word', message: 'Enter a word to look up.' });

  try {
    const provider = getDictionaryProvider();
    const key = `${provider.name}:${word}`;
    const { value, cached } = await dictionaryCache.getOrLoad(key, config.dictionaryCacheTtl, () =>
      provider.lookup(word),
    );
    return res.json({ ...value, cached });
  } catch (error) {
    if (error instanceof WordNotFoundError) {
      return res.status(404).json({
        error: 'not_found',
        message: `We couldn't find a dictionary entry for “${word}”. Check the spelling or try another word.`,
        word,
        suggestions: suggestWords(word, 5),
      });
    }
    return next(error);
  }
});

export default router;
