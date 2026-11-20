const ORIGIN = 'https://api.dictionaryapi.dev';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
  });
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/dictionary\/([^/]+)$/);
    if (!match) return json({ error: 'not_found', message: 'Use /api/dictionary/:word' }, 404);

    const word = decodeURIComponent(match[1]);
    if (!word) return json({ error: 'bad_request', message: 'A word is required.' }, 400);

    try {
      const upstream = await fetch(`${ORIGIN}/api/v2/entries/en/${encodeURIComponent(word)}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'Lexicon-Dictionary-Proxy/1.0' },
        cf: { cacheTtl: 3600, cacheEverything: true },
      });

      const text = await upstream.text();
      let payload;
      try { payload = JSON.parse(text); } catch { payload = { title: 'Upstream error', message: text.slice(0, 200) }; }

      return new Response(text, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('content-type') || 'application/json',
          ...corsHeaders,
          'Cache-Control': 'public, max-age=3600',
          'X-Lexicon-Proxy': 'cloudflare-worker',
        },
      });
    } catch (error) {
      return json({ error: 'proxy_error', message: error?.message || 'Could not reach dictionary upstream.' }, 502);
    }
  },
};
