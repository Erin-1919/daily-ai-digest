# Daily AI Digest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side React app that fetches AI news from NewsAPI, summarizes them with OpenAI GPT-4o, and displays a daily top-10 digest in a dark techy UI.

**Architecture:** Single-page React app (Vite). On load, check localStorage cache for today's digest. If not cached, fetch 30 articles from NewsAPI, send to GPT-4o for ranking/summarization, cache the result, and render. API keys come from env vars with localStorage fallback via a settings modal.

**Tech Stack:** React 18, Vite, NewsAPI.org, OpenAI GPT-4o, CSS (no UI library)

**Spec:** `docs/superpowers/specs/2026-03-31-daily-ai-digest-design.md`

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.css`
- Create: `.env`
- Modify: `.gitignore`

- [ ] **Step 1: Initialize Vite React project**

```bash
cd "E:/UCalgary_postdoc/vide_coding/daily-ai-digest"
npm create vite@latest . -- --template react
```

When prompted about existing files, choose to overwrite/ignore. This creates the scaffolding.

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 3: Create `.env` file**

```env
VITE_NEWSAPI_KEY=
VITE_OPENAI_KEY=
```

Leave values empty for now — the settings modal will handle missing keys.

- [ ] **Step 4: Clean up scaffolding**

Remove default Vite boilerplate. Replace `src/App.jsx` with:

```jsx
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>Daily AI Digest</h1>
    </div>
  )
}

export default App
```

Replace `src/App.css` with:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
```

Delete `src/assets/` folder and any default SVG files. Clean `index.html` title to "Daily AI Digest".

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts, page shows "Daily AI Digest" on dark background at `http://localhost:5173`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html src/ .env .gitignore
git commit -m "feat: scaffold Vite React project with dark theme base"
```

---

### Task 2: Cache Utility

**Files:**
- Create: `src/utils/cache.js`

- [ ] **Step 1: Create cache utility**

```js
const CACHE_PREFIX = 'ai-digest-'

function getTodayKey() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${CACHE_PREFIX}${yyyy}-${mm}-${dd}`
}

export function getCachedDigest() {
  try {
    const data = localStorage.getItem(getTodayKey())
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function cacheDigest(articles) {
  try {
    localStorage.setItem(getTodayKey(), JSON.stringify(articles))
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function clearTodayCache() {
  localStorage.removeItem(getTodayKey())
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/cache.js
git commit -m "feat: add localStorage cache utility for daily digest"
```

---

### Task 3: API Key Management Helpers

**Files:**
- Create: `src/utils/apiKeys.js`

- [ ] **Step 1: Create API key helpers**

```js
const NEWSAPI_KEY_STORAGE = 'newsapi-key'
const OPENAI_KEY_STORAGE = 'openai-key'

export function getNewsApiKey() {
  const envKey = import.meta.env.VITE_NEWSAPI_KEY
  if (envKey) return envKey
  return localStorage.getItem(NEWSAPI_KEY_STORAGE) || ''
}

export function getOpenAiKey() {
  const envKey = import.meta.env.VITE_OPENAI_KEY
  if (envKey) return envKey
  return localStorage.getItem(OPENAI_KEY_STORAGE) || ''
}

export function saveApiKeys(newsApiKey, openAiKey) {
  localStorage.setItem(NEWSAPI_KEY_STORAGE, newsApiKey)
  localStorage.setItem(OPENAI_KEY_STORAGE, openAiKey)
}

export function hasApiKeys() {
  return !!(getNewsApiKey() && getOpenAiKey())
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/apiKeys.js
git commit -m "feat: add API key helpers with env var + localStorage fallback"
```

---

### Task 4: NewsAPI Service

**Files:**
- Create: `src/services/newsApi.js`

- [ ] **Step 1: Create NewsAPI fetch service**

```js
import { getNewsApiKey } from '../utils/apiKeys'

const BASE_URL = 'https://newsapi.org/v2/everything'

export async function fetchAiNews() {
  const apiKey = getNewsApiKey()
  if (!apiKey) {
    throw new Error('NewsAPI key is not configured')
  }

  const params = new URLSearchParams({
    q: 'artificial intelligence OR AI OR OpenAI OR Anthropic OR deepmind',
    language: 'en',
    sortBy: 'publishedAt',
    pageSize: '30',
    apiKey,
  })

  const response = await fetch(`${BASE_URL}?${params}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `NewsAPI error: ${response.status}`)
  }

  const data = await response.json()

  if (!data.articles || data.articles.length === 0) {
    throw new Error('No AI news articles found for today')
  }

  return data.articles.map((article) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    source: article.source?.name || 'Unknown',
    publishedAt: article.publishedAt,
    imageUrl: article.urlToImage,
  }))
}
```

- [ ] **Step 2: Verify manually**

Open the browser console on the running dev server. Import and call `fetchAiNews()` (requires a valid key in `.env` first). Confirm it returns an array of article objects.

- [ ] **Step 3: Commit**

```bash
git add src/services/newsApi.js
git commit -m "feat: add NewsAPI service to fetch AI news articles"
```

---

### Task 5: OpenAI Summarization Service

**Files:**
- Create: `src/services/openai.js`

- [ ] **Step 1: Create OpenAI summarization service**

```js
import { getOpenAiKey } from '../utils/apiKeys'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

export async function summarizeArticles(articles) {
  const apiKey = getOpenAiKey()
  if (!apiKey) {
    throw new Error('OpenAI key is not configured')
  }

  const articleList = articles
    .map(
      (a, i) =>
        `${i + 1}. Title: ${a.title}\nDescription: ${a.description || 'N/A'}\nSource: ${a.source}\nURL: ${a.url}\nPublished: ${a.publishedAt}`
    )
    .join('\n\n')

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a news editor for an AI-focused daily digest. Given a list of articles, select and rank the top 10 most important stories. Return a JSON object with an "articles" array:
{
  "articles": [
    {
      "rank": 1,
      "title": "concise headline",
      "summary": "2-3 sentence summary of the story",
      "category": "Technical" | "Financial" | "Breaking" | "Event" | "Business" | "Research",
      "importance": "one sentence explaining why this matters",
      "originalUrl": "the article URL",
      "source": "source name",
      "publishedAt": "ISO date string"
    }
  ]
}

Categories:
- Technical: AI model releases, benchmarks, architecture breakthroughs
- Financial: Funding rounds, acquisitions, IPOs, market moves
- Breaking: Security incidents, leaks, unexpected developments
- Event: Conferences, keynotes, demos (GTC, NeurIPS, etc.)
- Business: Strategy, partnerships, product launches, hiring
- Research: Papers, studies, academic advances

Rank by importance to someone following the AI industry closely. Prefer diversity of categories.`,
        },
        {
          role: 'user',
          content: `Here are today's AI news articles:\n\n${articleList}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.error?.message || `OpenAI error: ${response.status}`
    )
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from OpenAI')
  }

  const parsed = JSON.parse(content)
  return parsed.articles
}
```

- [ ] **Step 2: Create graceful degradation fallback**

Add a fallback function at the bottom of the same file for when OpenAI fails:

```js
export function fallbackArticles(articles) {
  return articles.slice(0, 10).map((a, i) => ({
    rank: i + 1,
    title: a.title,
    summary: a.description || 'No description available.',
    category: 'Technical',
    importance: '',
    originalUrl: a.url,
    source: a.source,
    publishedAt: a.publishedAt,
  }))
}
```

- [ ] **Step 3: Commit**

```bash
git add src/services/openai.js
git commit -m "feat: add OpenAI GPT-4o summarization service with fallback"
```

---

### Task 6: Header Component

**Files:**
- Create: `src/components/Header.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create Header component**

```jsx
export default function Header({ onSettingsClick, onRefresh }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-title">/// DAILY AI DIGEST</div>
        <div className="header-actions">
          <button className="icon-btn" onClick={onRefresh} title="Refresh">
            ↻
          </button>
          <button className="icon-btn" onClick={onSettingsClick} title="Settings">
            ⚙
          </button>
        </div>
      </div>
      <div className="header-subtitle">{today} — TOP 10</div>
    </header>
  )
}
```

- [ ] **Step 2: Add Header styles to App.css**

Append to `src/App.css`:

```css
/* Header */
.header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #1a1a24;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 20px;
  color: #00ff88;
  letter-spacing: 2px;
}

.header-subtitle {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 12px;
  color: #666;
  margin-top: 6px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: 1px solid #333;
  color: #888;
  font-size: 16px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  color: #00ff88;
  border-color: #00ff88;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.jsx src/App.css
git commit -m "feat: add Header component with dark techy styling"
```

---

### Task 7: FilterBar Component

**Files:**
- Create: `src/components/FilterBar.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create FilterBar component**

```jsx
const CATEGORIES = [
  { key: 'All', color: '#00ff88' },
  { key: 'Technical', color: '#00ff88' },
  { key: 'Financial', color: '#f59e0b' },
  { key: 'Breaking', color: '#ef4444' },
  { key: 'Event', color: '#6366f1' },
  { key: 'Business', color: '#06b6d4' },
  { key: 'Research', color: '#a855f7' },
]

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="filter-bar">
      {CATEGORIES.map(({ key, color }) => (
        <button
          key={key}
          className={`filter-pill ${activeFilter === key ? 'active' : ''}`}
          style={
            activeFilter === key
              ? { background: color + '22', color, borderColor: color }
              : {}
          }
          onClick={() => onFilterChange(key)}
        >
          {key}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add FilterBar styles to App.css**

Append to `src/App.css`:

```css
/* FilterBar */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-pill {
  background: transparent;
  border: 1px solid #333;
  color: #666;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill:hover {
  color: #e0e0e0;
  border-color: #555;
}

.filter-pill.active {
  font-weight: 600;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/FilterBar.jsx src/App.css
git commit -m "feat: add FilterBar component with category pills"
```

---

### Task 8: NewsCard Component

**Files:**
- Create: `src/components/NewsCard.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create NewsCard component**

```jsx
const CATEGORY_COLORS = {
  Technical: '#00ff88',
  Financial: '#f59e0b',
  Breaking: '#ef4444',
  Event: '#6366f1',
  Business: '#06b6d4',
  Research: '#a855f7',
}

function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default function NewsCard({ article }) {
  const color = CATEGORY_COLORS[article.category] || '#00ff88'

  return (
    <a
      href={article.originalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="news-card"
      style={{ borderLeftColor: color }}
    >
      <div className="card-rank" style={{ color }}>
        {String(article.rank).padStart(2, '0')}
      </div>
      <div className="card-content">
        <div className="card-meta">
          <span
            className="card-category"
            style={{ background: color + '22', color }}
          >
            {article.category}
          </span>
          <span className="card-source">{article.source}</span>
          <span className="card-time">{timeAgo(article.publishedAt)}</span>
        </div>
        <h3 className="card-title">{article.title}</h3>
        <p className="card-summary">{article.summary}</p>
        {article.importance && (
          <p className="card-importance">▸ {article.importance}</p>
        )}
      </div>
    </a>
  )
}
```

- [ ] **Step 2: Add NewsCard styles to App.css**

Append to `src/App.css`:

```css
/* NewsCard */
.news-card {
  display: flex;
  gap: 16px;
  background: #111118;
  border-left: 3px solid #00ff88;
  border-radius: 0 8px 8px 0;
  padding: 16px;
  margin-bottom: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.news-card:hover {
  background: #16161f;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.05);
}

.card-rank {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 20px;
  font-weight: 700;
  min-width: 32px;
  padding-top: 2px;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.card-category {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-source {
  font-size: 11px;
  color: #666;
}

.card-time {
  font-size: 11px;
  color: #555;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 6px;
  line-height: 1.3;
}

.card-summary {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
  margin-bottom: 4px;
}

.card-importance {
  font-size: 12px;
  color: #00ff88;
  opacity: 0.7;
  font-style: italic;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/NewsCard.jsx src/App.css
git commit -m "feat: add NewsCard component with category colors and hover effects"
```

---

### Task 9: NewsList Component (with Loading Skeleton)

**Files:**
- Create: `src/components/NewsList.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create NewsList component**

```jsx
import NewsCard from './NewsCard'

function LoadingSkeleton() {
  return (
    <div className="skeleton-list">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-rank shimmer" />
          <div className="skeleton-content">
            <div className="skeleton-line short shimmer" />
            <div className="skeleton-line wide shimmer" />
            <div className="skeleton-line medium shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NewsList({ articles, loading, error, onRetry }) {
  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠</div>
        <p className="error-message">{error}</p>
        <button className="retry-btn" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="empty-state">
        <p>No AI news found for today.</p>
      </div>
    )
  }

  return (
    <div className="news-list">
      {articles.map((article) => (
        <NewsCard key={article.rank} article={article} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add NewsList styles to App.css**

Append to `src/App.css`:

```css
/* Loading Skeleton */
.skeleton-card {
  display: flex;
  gap: 16px;
  background: #111118;
  border-left: 3px solid #222;
  border-radius: 0 8px 8px 0;
  padding: 16px;
  margin-bottom: 10px;
}

.skeleton-rank {
  width: 32px;
  height: 24px;
  border-radius: 4px;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  border-radius: 4px;
}

.skeleton-line.short { width: 30%; }
.skeleton-line.wide { width: 90%; }
.skeleton-line.medium { width: 60%; }

.shimmer {
  background: linear-gradient(90deg, #1a1a24 25%, #222233 50%, #1a1a24 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.error-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
}

.retry-btn {
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 12px;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #ef444422;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 14px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/NewsList.jsx src/App.css
git commit -m "feat: add NewsList with loading skeleton and error states"
```

---

### Task 10: SettingsModal Component

**Files:**
- Create: `src/components/SettingsModal.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create SettingsModal component**

```jsx
import { useState } from 'react'
import { getNewsApiKey, getOpenAiKey, saveApiKeys } from '../utils/apiKeys'

export default function SettingsModal({ onClose, onSave }) {
  const [newsKey, setNewsKey] = useState(getNewsApiKey())
  const [openAiKey, setOpenAiKey] = useState(getOpenAiKey())

  function handleSave() {
    saveApiKeys(newsKey.trim(), openAiKey.trim())
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">⚙ Settings</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="input-label">
            NewsAPI Key
            <input
              type="password"
              className="input-field"
              value={newsKey}
              onChange={(e) => setNewsKey(e.target.value)}
              placeholder="Enter your NewsAPI.org key"
            />
          </label>
          <label className="input-label">
            OpenAI API Key
            <input
              type="password"
              className="input-field"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="Enter your OpenAI key"
            />
          </label>
        </div>
        <div className="modal-footer">
          <button className="save-btn" onClick={handleSave}>
            Save & Load Digest
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add SettingsModal styles to App.css**

Append to `src/App.css`:

```css
/* Settings Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #111118;
  border: 1px solid #333;
  border-radius: 12px;
  width: 420px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #222;
}

.modal-title {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 14px;
  color: #00ff88;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-label {
  font-size: 12px;
  color: #888;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-field {
  background: #0a0a0f;
  border: 1px solid #333;
  color: #e0e0e0;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Fira Code', 'Courier New', monospace;
}

.input-field:focus {
  outline: none;
  border-color: #00ff88;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #222;
}

.save-btn {
  width: 100%;
  background: #00ff8822;
  border: 1px solid #00ff88;
  color: #00ff88;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 1px;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #00ff8833;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsModal.jsx src/App.css
git commit -m "feat: add SettingsModal for API key configuration"
```

---

### Task 11: Wire Everything Together in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement the full App component**

Replace `src/App.jsx` with:

```jsx
import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import NewsList from './components/NewsList'
import SettingsModal from './components/SettingsModal'
import { fetchAiNews } from './services/newsApi'
import { summarizeArticles, fallbackArticles } from './services/openai'
import { getCachedDigest, cacheDigest, clearTodayCache } from './utils/cache'
import { hasApiKeys } from './utils/apiKeys'
import './App.css'

function App() {
  const [articles, setArticles] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [showSettings, setShowSettings] = useState(false)

  const loadDigest = useCallback(async (forceRefresh = false) => {
    if (!hasApiKeys()) {
      setLoading(false)
      setShowSettings(true)
      return
    }

    if (!forceRefresh) {
      const cached = getCachedDigest()
      if (cached) {
        setArticles(cached)
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const rawArticles = await fetchAiNews()

      let summarized
      try {
        summarized = await summarizeArticles(rawArticles)
      } catch {
        // Graceful degradation: show raw articles if OpenAI fails
        summarized = fallbackArticles(rawArticles)
      }

      cacheDigest(summarized)
      setArticles(summarized)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDigest()
  }, [loadDigest])

  function handleRefresh() {
    clearTodayCache()
    loadDigest(true)
  }

  function handleSettingsSave() {
    setShowSettings(false)
    clearTodayCache()
    loadDigest(true)
  }

  const filteredArticles =
    articles && filter !== 'All'
      ? articles.filter((a) => a.category === filter)
      : articles

  return (
    <div className="app">
      <Header
        onSettingsClick={() => setShowSettings(true)}
        onRefresh={handleRefresh}
      />
      <FilterBar activeFilter={filter} onFilterChange={setFilter} />
      <NewsList
        articles={filteredArticles}
        loading={loading}
        error={error}
        onRetry={() => loadDigest(true)}
      />
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />
      )}
    </div>
  )
}

export default App
```

- [ ] **Step 2: Verify the full app**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected behavior:
- If no API keys: settings modal appears
- If keys set in `.env`: loading skeleton → news cards rendered
- Filter pills work to narrow by category
- Refresh button clears cache and re-fetches

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire all components together in App with full data flow"
```

---

### Task 12: Final Polish & Build Verification

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update index.html metadata**

Ensure `index.html` has the correct title and meta:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Daily AI Digest</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify production build**

```bash
npm run build
```

Expected: `dist/` folder created with optimized assets, no errors.

- [ ] **Step 3: Preview production build**

```bash
npm run preview
```

Expected: App works at `http://localhost:4173` same as dev.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add Fira Code font and finalize HTML metadata"
```
