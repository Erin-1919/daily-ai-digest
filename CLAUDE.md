# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Daily AI Digest — a single-page React app (bundled with Vite) that fetches AI news from NewsAPI and asks GPT-4o to rank/summarize the top 10 stories. It ships as a Windows desktop app by loading the built `dist/` in a PyWebView window backed by a local HTTP server.

## Commands

```bash
# Frontend
npm install
npm run dev         # Vite dev server at http://localhost:5173
npm run build       # Output to dist/ (consumed by app.py)
npm run lint        # ESLint (flat config — v9)
npm run preview     # Preview built bundle

# Python desktop wrapper (Windows)
python -m venv venv
venv\Scripts\pip install -r requirements.txt
venv\Scripts\pip install Pillow   # only needed to regenerate the icon
venv\Scripts\pythonw.exe app.py   # run the desktop app (no console)
start.bat                         # same, double-clickable

# One-time setup
venv\Scripts\python.exe create_shortcut.py   # place desktop .lnk
venv\Scripts\python.exe generate_icon.py     # rebuild daily-ai-digest.ico
```

There is no test suite. `npm run lint` is the only automated check.

After editing `.env` or anything under `src/`, **rebuild with `npm run build`** — `app.py` serves `dist/`, so changes are invisible to the desktop app until rebuilt. `npm run dev` picks them up live in the browser.

## Architecture

**Two-layer app, one codebase.** The React SPA in `src/` is the entire product. `app.py` is a thin shell: it spawns a `SimpleHTTPRequestHandler` on an OS-chosen port pointing at `dist/`, then opens a PyWebView window to that URL. There is no IPC between Python and JS — Python only hosts static files.

**Fully client-side. No backend.** All API calls (NewsAPI, OpenAI) happen from the browser, so keys live in the browser too. Two sources, checked in this order (`src/utils/apiKeys.js`):

1. `import.meta.env.VITE_NEWSAPI_KEY` / `VITE_OPENAI_KEY` — baked in at build time from `.env`
2. `localStorage` — set by `SettingsModal` if env vars are empty

Because env vars are baked at build time, **changing `.env` requires `npm run build`**. In the desktop app you'd typically use Settings instead.

**Data flow** (`src/App.jsx` orchestrates, one call per day):

```
load → hasApiKeys? ──no──→ open SettingsModal
              │yes
              ▼
       getCachedDigest() (localStorage key: ai-digest-YYYY-MM-DD)
              │hit → render
              │miss
              ▼
       fetchAiNews()         src/services/newsApi.js   → 30 raw articles
              │
              ▼
       summarizeArticles()   src/services/openai.js    → ranked top 10 JSON
              │
              │  (on failure: fallbackArticles() returns first 10 unsummarized,
              │   all labeled "Technical" — degrades gracefully, still renders)
              ▼
       cacheDigest() + setArticles()
```

`handleRefresh` clears today's cache and forces a re-fetch (one extra API call).

**OpenAI contract** (`src/services/openai.js`): uses `response_format: { type: 'json_object' }` with `model: 'gpt-4o'`. The system prompt defines the exact JSON schema (`articles: [{rank, title, summary, category, importance, originalUrl, source, publishedAt}]`) and the six allowed categories. If you change the categories, update **all** of: the system prompt, `fallbackArticles` default category, `FilterBar` pill list, and the CSS category colors.

**Categories** (used for filtering, pill colors, card border color): `Technical` (#00ff88), `Financial` (#f59e0b), `Breaking` (#ef4444), `Event` (#6366f1), `Business` (#06b6d4), `Research` (#a855f7).

**Caching** (`src/utils/cache.js`): one localStorage entry per day, key `ai-digest-YYYY-MM-DD` (local time). Old entries are never pruned — acceptable because each is ~10 KB.

## Visual identity

Dark techy aesthetic. Background `#0a0a0f`, cards `#111118`, primary accent neon green `#00ff88`. Headings use Fira Code (loaded from Google Fonts in `index.html`); body is the system sans stack. The full color/typography spec is in `docs/superpowers/specs/2026-03-31-daily-ai-digest-design.md` — consult it before making style changes so new UI stays on-palette.

## Gotchas

- `.env` is gitignored; `.env.example` is the template. Missing keys don't crash — the app opens SettingsModal instead.
- The PyWebView window binds to `127.0.0.1` on a random port (`PORT = 0` in `app.py`), so nothing is exposed externally.
- `dist/` is gitignored and must be built before `app.py` will serve anything.
- `.superpowers/` is gitignored — it's a local scratchpad, not part of the app.
