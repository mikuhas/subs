import { useState, useEffect, useRef } from 'react'
import { User } from '../../../types/user'
import { useMessage } from '../../../contexts/MessageContext'

interface ConversationViewProps {
  user: User
  onClose: () => void
}

export const ConversationView = ({ user, onClose }: ConversationViewProps) => {
  const { getMessages, sendMessage } = useMessage()
  const [text, setText] = useState('')
  const messages = getMessages(user.id)
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

        <div className="conversation-input-bar">
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
