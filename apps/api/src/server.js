import { config } from './config.js';
import { createApp } from './app.js';
const app = createApp();
app.listen(config.port, () => {
  console.log(`Lexicon API listening on http://localhost:${config.port}`);
  console.log(`Dictionary provider: ${config.dictionaryProvider}`);
  console.log(`AI provider: ${config.aiProvider || 'not configured'}`);
});
