const CATEGORY_COLORS = {
  Technical: '#00ff88',
  Financial: '#f59e0b',
  Breaking: '#ef4444',
  Event: '#6366f1',
  Business: '#06b6d4',
  Research: '#a855f7',
}

function timeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
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
