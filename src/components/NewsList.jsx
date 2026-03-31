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
