import { Router } from 'express';
import { config } from '../config.js';
import { getDictionaryProvider } from '../providers/dictionary/index.js';
import { getAIProvider } from '../providers/ai/index.js';
const router = Router();
router.get('/', (req, res) => {
  const provider = getDictionaryProvider();
  const { provider: aiProvider, reason } = getAIProvider();
  res.json({
    version: config.version,
    dictionary: { provider: provider.name, label: provider.label, configured: provider.name !== 'commercial' || provider.configured },
    ai: { provider: aiProvider?.name || null, label: aiProvider?.label || null, model: config.aiModel || null, configured: Boolean(aiProvider), reason: reason || null },
    features: { audio: true, suggestions: true, aiSentences: Boolean(aiProvider) },
  });
});
export default router;
