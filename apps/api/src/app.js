import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import health from './routes/health.js';
import configRoutes from './routes/config.js';
import dictionary from './routes/dictionary.js';
import suggestions from './routes/suggestions.js';
import ai from './routes/ai.js';
import wordOfDay from './routes/wordOfDay.js';
import { notFound, errorHandler } from './middleware/error.js';
export function createApp() {
  const app = express();
  const origins = config.clientOrigin === '*' ? true : config.clientOrigin.split(',').map((item) => item.trim());
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '32kb' }));
  app.use('/api/health', health);
  app.use('/api/config', configRoutes);
  app.use('/api/dictionary', dictionary);
  app.use('/api/suggestions', suggestions);
  app.use('/api/ai', ai);
  app.use('/api/word-of-the-day', wordOfDay);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
