import { User } from '../../../types/user'
import { useMessage } from '../../../contexts/MessageContext'

interface MessagesPageProps {
  matchedUsers: User[]
  onOpenConversation: (user: User) => void
}

export const MessagesPage = ({ matchedUsers, onOpenConversation }: MessagesPageProps) => {
  const { getMessages, hasConversation } = useMessage()

  const conversationUsers = matchedUsers.filter(u => hasConversation(u.id))

  return (
    <div className="messages-page">
      <div className="messages-page-header">
        <h2>メッセージ</h2>
        <p>マッチングした相手とメッセージを交わそう</p>
      </div>

      {conversationUsers.length === 0 ? (
        <div className="messages-empty">
          <div className="messages-empty-icon"><i className="ri-message-3-line"></i></div>
          <p>まだメッセージがありません</p>
          <p className="messages-empty-sub">「マッチング」タブから相手にメッセージを送ってみましょう</p>
        </div>
      ) : (
        <div className="conversation-list">
          {conversationUsers.map(user => {
            const msgs = getMessages(user.id)
            const last = msgs[msgs.length - 1]
            return (
              <div
                key={user.id}
                className="conversation-list-item"
                onClick={() => onOpenConversation(user)}
              >
                <img src={user.image} alt={user.name} className="conversation-list-avatar" />
                <div className="conversation-list-info">
                  <div className="conversation-list-name">{user.name}</div>
                  <div className="conversation-list-last">
                    {last.fromMe && <span className="from-me-label">あなた: </span>}
                    {last.text}
                  </div>
                </div>
                <div className="conversation-list-time">
                  {new Date(last.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {matchedUsers.length > 0 && conversationUsers.length < matchedUsers.length && (
        <div className="messages-suggestions">
          <h3>メッセージを始めよう</h3>
          <div className="suggestion-avatars">
            {matchedUsers.filter(u => !hasConversation(u.id)).slice(0, 6).map(user => (
              <div
                key={user.id}
                className="suggestion-item"
                onClick={() => onOpenConversation(user)}
              >
                <img src={user.image} alt={user.name} />
                <span>{user.name.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
