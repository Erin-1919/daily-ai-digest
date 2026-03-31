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

  return data.articles
    .filter((a) => a.title && a.title !== '[Removed]')
    .map((article) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    source: article.source?.name || 'Unknown',
    publishedAt: article.publishedAt,
    imageUrl: article.urlToImage,
  }))
}
