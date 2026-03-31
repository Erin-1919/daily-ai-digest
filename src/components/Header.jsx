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
