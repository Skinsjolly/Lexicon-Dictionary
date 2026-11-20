import { config } from '../../config.js';
import { ProviderError } from '../../errors.js';
import { FreeDictionaryProvider } from './free.js';
import { CommercialDictionaryProvider } from './commercial.js';
let cachedProvider = null;
export function getDictionaryProvider() {
  if (cachedProvider) return cachedProvider;
  switch (config.dictionaryProvider) {
    case 'free': cachedProvider = new FreeDictionaryProvider(); break;
    case 'commercial': cachedProvider = new CommercialDictionaryProvider(); break;
    default: throw new ProviderError(`Unknown DICTIONARY_PROVIDER "${config.dictionaryProvider}". Use "free" or "commercial".`, 503);
  }
  return cachedProvider;
}
