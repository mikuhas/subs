import { useState } from 'react'
import { User } from '../../types/user'

interface ActivityPageProps {
  matchedUsers: User[]
  receivedLikes: User[]
  onRemoveMatched: (id: number) => void
  onProfileClick: (user: User) => void
  onMessage: (user: User) => void
  onLikeBack: (user: User) => void
  onDismiss: (id: number) => void
}

type SubTab = 'matched' | 'received'

export const ActivityPage = ({
  matchedUsers,
  receivedLikes,
  onRemoveMatched,
  onProfileClick,
  onMessage,
  onLikeBack,
  onDismiss,
}: ActivityPageProps) => {
  const [subTab, setSubTab] = useState<SubTab>('received')

  return (
    <div>
      <div className="activity-subtabs">
        <button
          className={`activity-subtab ${subTab === 'received' ? 'active' : ''}`}
          onClick={() => setSubTab('received')}
        >
          💌 いいねされた
          {receivedLikes.length > 0 && (
            <span className="activity-subtab-count">{receivedLikes.length}</span>
          )}
        </button>
        <button
          className={`activity-subtab ${subTab === 'matched' ? 'active' : ''}`}
          onClick={() => setSubTab('matched')}
        >
          💞 マッチング済み
          {matchedUsers.length > 0 && (
            <span className="activity-subtab-count">{matchedUsers.length}</span>
          )}
        </button>
      </div>

      {subTab === 'received' && (
        <div className="list-container">
          {receivedLikes.length === 0 ? (
            <div className="empty-message">
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💌</div>
              <p>いいねされた相手がいません</p>
            </div>
          ) : (
            <div className="user-list">
              {receivedLikes.map(user => (
                <div key={user.id} className="user-list-item">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="list-image"
                    onClick={() => onProfileClick(user)}
                  />
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p className="age-small">{user.age}歳 · {user.line}</p>
                    <p className="bio-small">{user.bio}</p>
                  </div>
                  <div className="user-list-actions">
                    <button className="likeback-button" onClick={() => onLikeBack(user)}>❤️ いいね</button>
                    <button className="remove-button" onClick={() => onDismiss(user.id)}>スルー</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'matched' && (
        <div className="list-container">
          {matchedUsers.length === 0 ? (
            <div className="empty-message">
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💞</div>
              <p>まだマッチングした相手がいません</p>
              <p style={{ fontSize: '0.85rem', color: '#aaa' }}>「いいねされた」タブから相手にいいねしてみよう</p>
            </div>
          ) : (
            <div className="user-list">
              {matchedUsers.map(user => (
                <div key={user.id} className="user-list-item">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="list-image"
                    onClick={() => onProfileClick(user)}
                  />
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p className="age-small">{user.age}歳 · {user.line}</p>
                    <p className="bio-small">{user.bio}</p>
                  </div>
                  <div className="user-list-actions">
                    <button className="message-button" onClick={() => onMessage(user)}>💬</button>
                    <button className="remove-button" onClick={() => onRemoveMatched(user.id)}>削除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
