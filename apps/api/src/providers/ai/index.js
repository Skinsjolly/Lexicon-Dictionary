import { config } from '../../config.js';
import { openAIProvider } from './openai.js';
import { anthropicProvider } from './anthropic.js';
import { geminiProvider } from './gemini.js';
const providers = { openai: openAIProvider, anthropic: anthropicProvider, gemini: geminiProvider };
export function getAIProvider() {
  if (!config.aiProvider) return { provider: null, reason: 'AI_PROVIDER is not set.' };
  if (!providers[config.aiProvider]) return { provider: null, reason: `Unsupported AI_PROVIDER "${config.aiProvider}".` };
  if (!config.aiApiKey) return { provider: null, reason: 'AI_API_KEY is not set.' };
  return { provider: providers[config.aiProvider], reason: null };
}
export const supportedAIProviders = Object.keys(providers);
