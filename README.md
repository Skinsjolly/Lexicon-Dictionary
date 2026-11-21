# Lexicon

A modern, standalone dictionary web app with clean definitions, pronunciation, saved words, search history, and an **AI Sentence** feature that writes original examples for each meaning.

Lexicon is a separate repository and web app from the Hearth ecosystem. It is linked from the ecosystem shortcuts, but runs independently and can be deployed anywhere.

## Features

- Real dictionary data from the [Free Dictionary API](https://dictionaryapi.dev/)
- Provider abstraction so you can switch dictionary APIs later
- Definitions grouped by part of speech, numbered, with traditional examples
- Phonetics, audio pronunciation, syllables when available, and origin when available
- AI-generated example sentences with a separate AI provider abstraction
- Honest fallback when no AI provider is configured — no fabricated sentences
- Search suggestions, recent searches, saved words, word of the day
- Copy definitions and examples
- Light and dark themes with persistence
- Responsive desktop, tablet, and mobile layout

## Architecture

```
Lexicon-Dictionary/
├── apps/
│   ├── api/                 # Express backend
│   │   └── src/
│   │       ├── providers/
│   │       │   ├── dictionary/  # FreeDictionaryProvider, CommercialDictionaryProvider
│   │       │   └── ai/          # OpenAI, Anthropic, Gemini adapters
│   │       ├── routes/          # /api/dictionary, /api/ai, ...
│   │       ├── services/        # AI sentence generation + caching
│   │       └── utils/           # Normalization, suggestions, word of the day
│   └── web/                 # React + TypeScript + Vite + Tailwind frontend
└── render.yaml              # Render backend blueprint
```

Every dictionary provider returns the same normalized shape:

```ts
{
  word, phonetic, phonetics, audio, syllables, origin,
  meanings: [{ partOfSpeech, definitions: [{ definition, example, synonyms, antonyms }] }],
  sourceUrls, license, provider, fetchedAt
}
```

The frontend never talks to a dictionary or AI provider directly — it only calls the Lexicon backend.

## Local development

Requirements: Node.js 20+ and npm 10+.

```bash
git clone https://github.com/Skinsjolly/Lexicon-Dictionary.git
cd Lexicon-Dictionary
npm install
cp .env.example .env
npm run dev
```

- Frontend: http://localhost:5200
- Backend: http://localhost:4000
- Health check: http://localhost:4000/api/health

In development, Vite proxies `/api` to the backend automatically.

## Environment variables

Copy `.env.example` to `.env`.

### Dictionary

| Variable | Default | Purpose |
| --- | --- | --- |
| `DICTIONARY_PROVIDER` | `free` | `free` or `commercial` |
| `DICTIONARY_CACHE_TTL` | `86400000` | Dictionary cache lifetime in ms |
| `DICTIONARY_PROXY_URL` | Cloudflare proxy URL | Optional proxy base URL override for hosts whose outbound IP is blocked by the upstream API |
| `COMMERCIAL_DICTIONARY_LABEL` | `Commercial Dictionary` | Server-side provider label |
| `COMMERCIAL_DICTIONARY_BASE_URL` | empty | Your commercial API endpoint |
| `COMMERCIAL_DICTIONARY_API_KEY` | empty | Your commercial API key |

### AI sentences

| Variable | Default | Purpose |
| --- | --- | --- |
| `AI_PROVIDER` | empty | `openai`, `anthropic`, `gemini`, or `ecosystem` |
| `AI_MODEL` | empty | Model name, e.g. `gpt-4.1-mini` |
| `AI_API_KEY` | empty | Provider key, or the shared token when using `ecosystem` |
| `AI_BASE_URL` | empty | Optional compatible endpoint override |
| `AI_CACHE_TTL` | `604800000` | AI sentence cache lifetime in ms |

If `AI_PROVIDER` or `AI_API_KEY` is missing, the AI Sentence card clearly says AI is unavailable. Dictionary lookup still works normally.

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend URL, e.g. `https://lexicon-dictionary-api.onrender.com`. Leave empty in local dev. |

Never prefix secrets with `VITE_`. Anything prefixed with `VITE_` is bundled into the browser.

## Switching dictionary providers

1. Implement or adapt a provider in `apps/api/src/providers/dictionary/`.
2. Return the normalized entry shape from `lookup(word)`.
3. Add a case in `apps/api/src/providers/dictionary/index.js`.
4. Set `DICTIONARY_PROVIDER=commercial` and the commercial env vars.
5. Redeploy the backend.

The existing `CommercialDictionaryProvider` is a generic starting point. For Oxford, Merriam-Webster, or another API, map its response fields inside that file and pass the result to `normalizeDictionaryEntry()`.

## Configuring AI providers

Set these on the backend and redeploy:

```bash
AI_PROVIDER=openai
AI_MODEL=gpt-4.1-mini
AI_API_KEY=sk-...
```

Supported values:

- `openai` — Chat Completions API
- `anthropic` — Messages API
- `gemini` — Google Generative Language API
- `ecosystem` — calls the Ecosystem backend's Gemini-powered sentence endpoint, so the Gemini key stays in the ecosystem service. Set `AI_API_KEY` to the same shared `LEXICON_AI_TOKEN` configured there.

To reuse the ecosystem's Gemini API:

```bash
AI_PROVIDER=ecosystem
AI_MODEL=gemini-3.5-flash-lite
AI_API_KEY=<same value as LEXICON_AI_TOKEN on the ecosystem backend>
```

The prompt asks for one original sentence per meaning, forbids copying traditional examples, and requests strict JSON. Responses are validated, deduplicated, and cached so repeated searches do not spend credits again.

Provider names, models, configuration reasons, and raw upstream errors are kept server-side; they are not exposed in the public UI or API responses.

## Deployment

### Backend on Render

`render.yaml` defines a free Node web service named `lexicon-dictionary-api`.

1. Push this repo to GitHub.
2. In Render, create a new **Blueprint** from this repository.
3. Add `AI_PROVIDER`, `AI_MODEL`, and `AI_API_KEY` when you are ready.
4. Render will run `npm install` and `npm start`.

### Frontend on Cloudflare Pages

```bash
npm install
VITE_API_URL=https://your-render-backend.onrender.com npm run build
npx wrangler pages deploy apps/web/dist --project-name ecosystem-dictionary
```

Set `VITE_API_URL` as a build-time environment variable in your host. The `public/_redirects` file enables SPA routing.

### Other hosts

The frontend is a static Vite build in `apps/web/dist`. The backend is a standard Node/Express app started with `npm start`. Both work on Vercel, Netlify, Fly.io, Railway, Render, or Cloudflare-adjacent setups.

## API routes

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Basic health |
| `GET /api/dictionary/:word` | Normalized dictionary entry |
| `GET /api/suggestions?q=` | Prefix suggestions |
| `GET /api/word-of-the-day` | Daily curated word with full entry |
| `POST /api/ai/sentence` | Generate or fetch cached AI sentences |

## Tests

```bash
npm test
npm run typecheck
npm run build
```
