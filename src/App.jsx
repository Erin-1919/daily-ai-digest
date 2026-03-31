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
