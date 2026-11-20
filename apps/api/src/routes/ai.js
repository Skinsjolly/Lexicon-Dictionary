import { Router } from 'express';
import { generateAISentences } from '../services/aiSentences.js';
import { extractWord } from '../utils/normalize.js';
import { rememberWord } from '../utils/suggestions.js';

const router = Router();

router.post('/sentence', async (req, res, next) => {
  try {
    const word = extractWord(req.body?.word || '');
    if (!word) return res.status(400).json({ error: 'invalid_word', message: 'A word is required.' });

    const meanings = Array.isArray(req.body?.meanings) ? req.body.meanings.slice(0, 3) : [];
    rememberWord(word);

    const result = await generateAISentences({ word, meanings });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;
