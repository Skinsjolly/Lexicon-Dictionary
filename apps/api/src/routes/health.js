import { Router } from 'express';
import { config } from '../config.js';

const router = Router();

router.get('/', (req, res) =>
  res.json({ ok: true, service: 'lexicon-api', version: config.version, uptime: process.uptime() })
);

export default router;
