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
