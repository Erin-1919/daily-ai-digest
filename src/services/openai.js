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
