import { Router } from 'express';
import { config } from '../config.js';
import { dictionaryCache } from '../cache.js';
import { getDictionaryProvider } from '../providers/dictionary/index.js';
import { getAIProvider } from '../providers/ai/index.js';
const router = Router();
let providerStatus = null;
let lastChecked = 0;
router.get('/', (req, res) => res.json({ ok: true, service: 'lexicon-api', version: config.version, uptime: process.uptime() }));
router.get('/providers', async (req, res) => {
  const now = Date.now();
  if (!providerStatus || now - lastChecked > 5 * 60 * 1000) {
    const dictionaryProvider = getDictionaryProvider();
    const { provider: aiProvider, reason } = getAIProvider();
    let dictionary = 'unknown';
    try { await dictionaryCache.getOrLoad(`health:${dictionaryProvider.name}`, 60_000, () => dictionaryProvider.check()); dictionary = 'ok'; }
    catch { dictionary = 'error'; }
    providerStatus = { dictionary, ai: aiProvider ? 'configured' : 'not_configured', aiReason: reason || null, checkedAt: new Date().toISOString() };
    lastChecked = now;
  }
  res.json(providerStatus);
});
export default router;
