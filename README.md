# Daily AI Digest

A desktop app that fetches the top 10 AI news daily, summarized and categorized by GPT-4o. Dark techy aesthetic with neon green accents.

## Setup

### 1. Install Node dependencies and build

```bash
npm install
npm run build
```

### 2. Set up Python environment

```bash
python -m venv venv
venv\Scripts\pip install pywebview Pillow
```

### 3. Configure API keys

Copy `.env.example` to `.env` and add your keys:

```
VITE_NEWSAPI_KEY=your_newsapi_key
VITE_OPENAI_KEY=your_openai_api_key
```

- Get a NewsAPI key at https://newsapi.org
- Get an OpenAI key at https://platform.openai.com/api-keys

Alternatively, skip the `.env` file and enter keys in the Settings modal when the app opens.

**Note:** After changing `.env`, rebuild with `npm run build`.

## Running

### Desktop app (no console window)

Double-click `start.bat`, or:

```bash
venv\Scripts\pythonw.exe app.py
```

### Desktop shortcut

Run once to place a shortcut on your desktop:

```bash
venv\Scripts\python.exe create_shortcut.py
```

### Browser (development)

```bash
npm run dev
```

Opens at http://localhost:5173.

## How it works

1. On launch, checks localStorage cache for today's digest
2. If not cached, fetches 30 AI articles from NewsAPI
3. Sends them to GPT-4o for ranking, summarization, and categorization
4. Displays the top 10 stories with category filters
5. Caches results for the rest of the day (1 API call per day)

## Categories

- **Technical** - Model releases, benchmarks, architecture breakthroughs
- **Financial** - Funding rounds, acquisitions, market moves
- **Breaking** - Security incidents, leaks, unexpected developments
- **Event** - Conferences, keynotes, demos
- **Business** - Strategy, partnerships, product launches
- **Research** - Papers, studies, academic advances
