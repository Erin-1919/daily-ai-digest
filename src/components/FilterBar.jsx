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
