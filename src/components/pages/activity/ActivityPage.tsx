import { useState, useEffect } from 'react'
import { User } from '../../../types/user'
import { getDistanceLabel } from '../../../utils/distance'
import { mockCommunities } from '../../../data/communities'

const RANDOM_MATCH_LIMIT = 3
const STORAGE_KEY = 'randomMatch'

function getDailyCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    return date === new Date().toDateString() ? count : 0
  } catch {
    return 0
  }
}

function incrementDailyCount(): void {
  const count = getDailyCount() + 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), count }))
}

interface ActivityPageProps {
  matchedUsers: User[]
  receivedLikes: User[]
  profileAge?: number
  onRandomMatch: () => void
  onRemoveMatched: (id: number) => void
  onProfileClick: (user: User) => void
  onMessage: (user: User) => void
  onLikeBack: (user: User) => void
  onDismiss: (id: number) => void
  onReview: (user: User) => void
}

type SubTab = 'matched' | 'received'

export const ActivityPage = ({
  matchedUsers,
  receivedLikes,
  profileAge,
  onRandomMatch,
  onRemoveMatched,
  onProfileClick,
  onMessage,
  onLikeBack,
  onDismiss,
  onReview,
}: ActivityPageProps) => {
  const [subTab, setSubTab] = useState<SubTab>('received')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [dailyCount, setDailyCount] = useState(getDailyCount)

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      incrementDailyCount()
      setDailyCount(getDailyCount())
      onRandomMatch()
      setCountdown(null)
      return
    }
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, onRandomMatch])

  const handleRandomClick = () => {
    if (!profileAge || dailyCount >= RANDOM_MATCH_LIMIT) return
    setCountdown(3)
  }

  const remaining = RANDOM_MATCH_LIMIT - dailyCount

  return (
    <div>
      {/* ランダムマッチ */}
      <div className="random-match-section">
        <div className="random-match-header">
          <span className="random-match-title">🎲 ランダムマッチ</span>
          <span className="random-match-remaining">残り {remaining}/{RANDOM_MATCH_LIMIT} 回</span>
        </div>
        <p className="random-match-desc">条件を超えた「運命の相手」と出会う</p>
        {countdown !== null ? (
          <div className="random-match-countdown">{countdown === 0 ? '✨' : countdown}</div>
        ) : (
          <button
            className="random-match-btn"
            onClick={handleRandomClick}
            disabled={!profileAge || remaining <= 0}
          >
            {remaining <= 0 ? '本日の上限に達しました' : '運命の相手を探す'}
          </button>
        )}
      </div>

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
                    <p className="age-small">{user.age}歳 · {getDistanceLabel(user.distanceKm)}</p>
                    <p className="age-small"><i className="ri-subway-line"></i> {user.line}</p>
                    {user.communityIds.length > 0 && (
                      <div className="user-info-communities">
                        {user.communityIds.map(cid => {
                          const c = mockCommunities.find(c => c.id === cid)
                          return c ? <span key={cid} className="user-info-community-tag">{c.name}</span> : null
                        })}
                      </div>
                    )}
                  </div>
                  <div className="user-list-actions">
                    <button className="likeback-button" onClick={() => onLikeBack(user)}><i className="ri-heart-fill"></i> いいね</button>
                    <button className="remove-button" onClick={() => onDismiss(user.id)}>スキップ</button>
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
                    <p className="age-small">{user.age}歳 · {getDistanceLabel(user.distanceKm)}</p>
                    <p className="age-small"><i className="ri-subway-line"></i> {user.line}</p>
                    {user.communityIds.length > 0 && (
                      <div className="user-info-communities">
                        {user.communityIds.map(cid => {
                          const c = mockCommunities.find(c => c.id === cid)
                          return c ? <span key={cid} className="user-info-community-tag">{c.name}</span> : null
                        })}
                      </div>
                    )}
                  </div>
                  <div className="user-list-actions">
                    <button className="message-button" onClick={() => onMessage(user)}>💬</button>
                    <button className="review-open-btn" onClick={() => onReview(user)}>⭐ レビュー</button>
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
