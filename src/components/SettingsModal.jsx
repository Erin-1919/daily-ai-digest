import { useState } from 'react'
import { saveApiKeys } from '../utils/apiKeys'

export default function SettingsModal({ onClose, onSave }) {
  const [newsKey, setNewsKey] = useState(
    () => localStorage.getItem('newsapi-key') || ''
  )
  const [openAiKey, setOpenAiKey] = useState(
    () => localStorage.getItem('openai-key') || ''
  )

  function handleSave() {
    saveApiKeys(newsKey.trim(), openAiKey.trim())
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">⚙ Settings</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="input-label">
            NewsAPI Key
            <input
              type="password"
              className="input-field"
              value={newsKey}
              onChange={(e) => setNewsKey(e.target.value)}
              placeholder="Enter your NewsAPI.org key"
            />
          </label>
          <label className="input-label">
            OpenAI API Key
            <input
              type="password"
              className="input-field"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="Enter your OpenAI key"
            />
          </label>
        </div>
        <div className="modal-footer">
          <button className="save-btn" onClick={handleSave}>
            Save & Load Digest
          </button>
        </div>
      </div>
    </div>
  )
}
