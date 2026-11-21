import { config } from '../../config.js';
import { openAIProvider } from './openai.js';
import { anthropicProvider } from './anthropic.js';
import { geminiProvider } from './gemini.js';
import { ecosystemProvider } from './ecosystem.js';

const providers = {
  openai: openAIProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  ecosystem: ecosystemProvider,
};

export function getAIProvider() {
  if (!config.aiProvider) return { provider: null, reason: 'AI_PROVIDER is not set.' };
  if (!providers[config.aiProvider]) {
    return { provider: null, reason: `Unsupported AI_PROVIDER "${config.aiProvider}".` };
  }
  if (!config.aiApiKey) {
    const hint = config.aiProvider === 'ecosystem' ? 'AI_API_KEY must be the Ecosystem shared token.' : 'AI_API_KEY is not set.';
    return { provider: null, reason: hint };
  }
  return { provider: providers[config.aiProvider], reason: null };
}

export const supportedAIProviders = Object.keys(providers);
