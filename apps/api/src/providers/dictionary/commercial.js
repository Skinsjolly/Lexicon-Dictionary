import { config } from '../../config.js';
import { ProviderError, WordNotFoundError } from '../../errors.js';
import { normalizeDictionaryEntry } from '../../utils/normalize.js';
export class CommercialDictionaryProvider {
  name = 'commercial';
  label = config.commercialDictionary.label;
  get configured() { return Boolean(config.commercialDictionary.baseUrl && config.commercialDictionary.apiKey); }
  async lookup(word) {
    if (!this.configured) throw new ProviderError('Commercial dictionary provider is selected, but COMMERCIAL_DICTIONARY_BASE_URL and COMMERCIAL_DICTIONARY_API_KEY are not configured.', 503);
    const url = new URL(config.commercialDictionary.baseUrl);
    url.searchParams.set('word', word);
    url.searchParams.set('key', config.commercialDictionary.apiKey);
    let response;
    try { response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) }); }
    catch { throw new ProviderError('Could not reach the configured commercial dictionary API.'); }
    if (response.status === 404) throw new WordNotFoundError(word);
    if (!response.ok) throw new ProviderError(`Commercial dictionary API returned ${response.status}.`);
    let payload;
    try { payload = await response.json(); } catch { throw new ProviderError('Commercial dictionary API returned an invalid response.'); }
    const entry = normalizeDictionaryEntry(payload, this.name);
    if (!entry) throw new ProviderError('Commercial dictionary API returned no usable definitions.');
    return entry;
  }
  async check() { if (!this.configured) return false; await this.lookup('test'); return true; }
}
