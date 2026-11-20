import { Router } from 'express';
import { config } from '../config.js';
import { suggestWords } from '../utils/suggestions.js';

const router = Router();

router.get('/', (req, res) => {
  const q = String(req.query.q || '').slice(0, 60);
  res.json({ suggestions: suggestWords(q, config.suggestionLimit) });
});

export default router;
