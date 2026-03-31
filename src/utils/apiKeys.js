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
