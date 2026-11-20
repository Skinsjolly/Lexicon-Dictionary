import { config } from '../../config.js';
import { WordNotFoundError, ProviderError } from '../../errors.js';
import { normalizeDictionaryEntry } from '../../utils/normalize.js';
export class FreeDictionaryProvider {
  name = 'free';
  label = 'Free Dictionary API';
  async lookup(word) {
    const origin = config.dictionaryProxyUrl
      ? `${config.dictionaryProxyUrl}/api/dictionary/${encodeURIComponent(word)}`
      : `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    let response;
    try {
      response = await fetch(origin, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    } catch { throw new ProviderError('Could not reach the Free Dictionary API. Please try again shortly.'); }
    if (response.status === 404) throw new WordNotFoundError(word);
    if (!response.ok) throw new ProviderError(`Dictionary provider returned ${response.status}.`);
    let payload;
    try { payload = await response.json(); } catch { throw new ProviderError('Dictionary provider returned an invalid response.'); }
    const entry = normalizeDictionaryEntry(payload, this.name);
    if (!entry) throw new WordNotFoundError(word);
    return entry;
  }
  async check() { await this.lookup('test'); return true; }
}
