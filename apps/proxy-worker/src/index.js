const DICTIONARY_ORIGIN = 'https://api.dictionaryapi.dev';
const WIKTIONARY_ORIGIN = 'https://en.wiktionary.org';
const USER_AGENT = 'Lexicon-Dictionary-Proxy/1.0 (https://ecosystem-dictionary.pages.dev)';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders, ...extraHeaders },
  });
}

function passthrough(upstream, extraHeaders = {}) {
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      ...corsHeaders,
      'Cache-Control': 'public, max-age=3600',
      'X-Lexicon-Proxy': 'cloudflare-worker',
      ...extraHeaders,
    },
  });
}

async function proxyDictionary(word) {
  const upstream = await fetch(`${DICTIONARY_ORIGIN}/api/v2/entries/en/${encodeURIComponent(word)}`, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  return passthrough(upstream);
}

/**
 * Wiktionary is used as a fallback when the primary dictionary has no entry
 * for a word (common for newer slang). Returns structured definitions plus a
 * plain-text extract for pronunciation, etymology, and related-word labels.
 */
async function proxyWiktionary(word) {
  const definitionUrl = `${WIKTIONARY_ORIGIN}/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
  const extractUrl = `${WIKTIONARY_ORIGIN}/w/api.php?action=query&format=json&prop=extracts&explaintext=1&redirects=1&titles=${encodeURIComponent(word)}`;

  const [definitionResponse, extractResponse] = await Promise.all([
    fetch(definitionUrl, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      cf: { cacheTtl: 86400, cacheEverything: true },
    }),
    fetch(extractUrl, {
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      cf: { cacheTtl: 86400, cacheEverything: true },
    }),
  ]);

  let definition = null;
  try {
    definition = await definitionResponse.json();
  } catch {
    definition = null;
  }

  let extract = '';
  try {
    const payload = await extractResponse.json();
    const page = Object.values(payload?.query?.pages || {})[0];
    extract = typeof page?.extract === 'string' ? page.extract : '';
  } catch {
    extract = '';
  }

  return json(
    { definition, extract },
    definitionResponse.status,
    {
      'Cache-Control': 'public, max-age=86400',
      'X-Lexicon-Source': 'wiktionary',
    }
  );
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

    const url = new URL(request.url);

    const dictionaryMatch = url.pathname.match(/^\/api\/dictionary\/([^/]+)$/);
    if (dictionaryMatch) {
      const word = decodeURIComponent(dictionaryMatch[1]);
      if (!word) return json({ error: 'bad_request', message: 'A word is required.' }, 400);
      try {
        return await proxyDictionary(word);
      } catch (error) {
        return json({ error: 'proxy_error', message: error?.message || 'Could not reach dictionary upstream.' }, 502);
      }
    }

    const wiktionaryMatch = url.pathname.match(/^\/api\/wiktionary\/([^/]+)$/);
    if (wiktionaryMatch) {
      const word = decodeURIComponent(wiktionaryMatch[1]);
      if (!word) return json({ error: 'bad_request', message: 'A word is required.' }, 400);
      try {
        return await proxyWiktionary(word);
      } catch (error) {
        return json({ error: 'proxy_error', message: error?.message || 'Could not reach Wiktionary.' }, 502);
      }
    }

    return json({ error: 'not_found', message: 'Use /api/dictionary/:word or /api/wiktionary/:word' }, 404);
  },
};
