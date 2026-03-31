# Daily AI Digest — Design Spec

## Overview

A single-page React web app that fetches the top AI news daily and presents an AI-summarized, categorized digest of the 10 most important stories. Dark, techy/hacker aesthetic.

## Tech Stack

- **Frontend**: React 18 + Vite
- **News source**: NewsAPI.org (free tier, 100 req/day)
- **Summarization**: OpenAI GPT-4o
- **Styling**: CSS (dark theme, monospace accents, neon highlights)
- **Deployment**: Static files — `npm run build` and serve anywhere

## Architecture

Client-side only. No backend server.

```
User opens page
  → Check localStorage cache for today's digest
  → If cached: render immediately
  → If not cached:
      → Fetch articles from NewsAPI (query: "artificial intelligence OR AI OR OpenAI OR Anthropic OR deepmind", category: technology, language: en, sortBy: publishedAt, pageSize: 30)
      → Send article titles + descriptions to OpenAI GPT-4o
      → GPT-4o returns ranked, summarized, categorized top 10
      → Cache result in localStorage keyed by date
      → Render digest
```

## API Keys

- Primary: Vite environment variables (`VITE_NEWSAPI_KEY`, `VITE_OPENAI_KEY`)
- Fallback: If env vars are empty, show a settings modal on first load where the user pastes keys (stored in localStorage)

## OpenAI Prompt Design

System prompt:

```
You are a news editor for an AI-focused daily digest.
Given these articles, rank the top 10 by importance and return JSON:
[{
  rank: 1,
  title: "...",
  summary: "2-3 sentence summary",
  category: "Technical" | "Financial" | "Breaking" | "Event" | "Business" | "Research",
  importance: "why this matters in 1 sentence",
  originalUrl: "..."
}]
```

Categories cover: technical advances, financial/funding news, breaking/security news, conferences/events, business strategy, and research papers.

## Components

### App
- Root component. Manages global state: `loading`, `loaded`, `error`, `showSettings`.
- On mount: check cache → fetch if needed → render.

### Header
- Title: "DAILY AI DIGEST" (monospace, neon green)
- Subtitle: today's date + "TOP 10"
- Dark background (#0a0a0f)

### FilterBar
- Horizontal row of category pills: All, Technical, Financial, Breaking, Event, Business, Research
- Active pill highlighted; filters the visible cards
- Pill colors match category colors

### NewsList
- Renders up to 10 `NewsCard` components
- Shows loading skeleton while fetching
- Shows error state with retry button on failure

### NewsCard
- Dark card (#111118) with colored left border matching category
- Content: rank number, category badge, title, AI summary, "why it matters" line, source name, time ago, link to original article
- Hover effect: subtle glow

### SettingsModal
- Triggered by gear icon in header, or auto-shown if no API keys found
- Two input fields: NewsAPI key, OpenAI key
- Save to localStorage
- Test connection button (optional, nice-to-have)

## Visual Design

### Color Palette
- Background: `#0a0a0f`
- Card background: `#111118`
- Primary text: `#e0e0e0`
- Secondary text: `#666666`
- Accent (primary): `#00ff88` (neon green)

### Category Colors
| Category   | Color     |
|------------|-----------|
| Breaking   | `#ef4444` |
| Technical  | `#00ff88` |
| Financial  | `#f59e0b` |
| Event      | `#6366f1` |
| Business   | `#06b6d4` |
| Research   | `#a855f7` |

### Typography
- Headings: monospace (e.g., `'Fira Code', 'Courier New', monospace`)
- Body: system sans-serif stack
- Category labels: uppercase, letter-spacing, small font size

## Caching Strategy

- Key: `ai-digest-YYYY-MM-DD`
- Value: JSON array of the 10 ranked articles
- On page load, check for today's cache before making API calls
- Manual "Refresh" button to force re-fetch and overwrite cache

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No API keys | Show settings modal |
| NewsAPI failure | Error message with retry button |
| OpenAI failure | Show raw articles without AI summaries (graceful degradation) |
| No articles found | "No AI news found for today" message |

## File Structure

```
daily-ai-digest/
├── index.html
├── package.json
├── vite.config.js
├── .env                  # VITE_NEWSAPI_KEY, VITE_OPENAI_KEY
├── .gitignore
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── FilterBar.jsx
│   │   ├── NewsList.jsx
│   │   ├── NewsCard.jsx
│   │   └── SettingsModal.jsx
│   ├── services/
│   │   ├── newsApi.js      # NewsAPI fetch logic
│   │   └── openai.js       # OpenAI summarization logic
│   └── utils/
│       └── cache.js        # localStorage cache helpers
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-03-31-daily-ai-digest-design.md
```
