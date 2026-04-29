import { useState, useEffect, useRef } from 'react'
import { User } from '../../../types/user'
import { useMessage } from '../../../contexts/MessageContext'

interface ConversationViewProps {
  user: User
  onClose: () => void
}

const MOOD_OPTIONS = [
  { icon: '📞', label: '電話をしたい' },
  { icon: '🍽️', label: 'デートに行きたい' },
  { icon: '💬', label: '連絡先を交換したい' },
  { icon: '📷', label: 'もっと写真が見たい' },
]

export const ConversationView = ({ user, onClose }: ConversationViewProps) => {
  const { getMessages, sendMessage, setIntention, getIntention } = useMessage()
  const [text, setText] = useState('')
  const [showMood, setShowMood] = useState(false)
  const messages = getMessages(user.id)
  const intention = getIntention(user.id)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    sendMessage(user.id, trimmed)
    setText('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMood = (icon: string, label: string) => {
    setIntention(user.id, { icon, label })
    setShowMood(false)
  }

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="conversation-overlay">
      <div className="conversation-container">
        <div className="conversation-header">
          <button className="conversation-back" onClick={onClose}>←</button>
          <img src={user.image} alt={user.name} className="conversation-avatar" />
          <div>
            <div className="conversation-name">{user.name}</div>
            <div className="conversation-age">{user.age}歳</div>
          </div>
        </div>

        {/* 意欲カード */}
        {intention && (
          <div className="intention-card">
            <span className="intention-card-icon">{intention.icon}</span>
            <div className="intention-card-text">
              <span className="intention-card-label">あなたの気持ち</span>
              <span className="intention-card-value">{intention.label}</span>
            </div>
            <button className="intention-card-clear" onClick={() => setIntention(user.id, null)}>×</button>
          </div>
        )}

        <div className="conversation-messages">
          {messages.length === 0 && (
            <p className="conversation-empty">最初のメッセージを送ってみましょう！</p>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.fromMe ? 'from-me' : 'from-them'}`}>
              {!msg.fromMe && (
                <img src={user.image} alt={user.name} className="message-avatar" />
              )}
              <div className="message-content">
                <div className="message-bubble">{msg.text}</div>
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 気持ちパネル */}
        {showMood && (
          <div className="mood-panel">
            <p className="mood-panel-title">今の気持ちを伝えよう</p>
            <div className="mood-panel-grid">
              {MOOD_OPTIONS.map(({ icon, label }) => (
                <button key={label} className={`mood-chip ${intention?.label === label ? 'active' : ''}`} onClick={() => handleMood(icon, label)}>
                  <span className="mood-chip-icon">{icon}</span>
                  <span className="mood-chip-label">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="conversation-input-bar">
          <button
            className={`mood-toggle-btn ${showMood ? 'active' : ''}`}
            onClick={() => setShowMood(v => !v)}
            title="気持ちを選ぶ"
          >
            💭
          </button>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="メッセージを入力..."
            className="conversation-input"
          />
          <button
            className="conversation-send"
            onClick={handleSend}
            disabled={!text.trim()}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  )
}
