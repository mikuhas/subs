import { useState } from 'react'
import { User } from '../../types/user'
import { getDistanceLabel } from '../../utils/distance'

interface ProfileDetailProps {
  user: User
  onBack: () => void
  onOpenBoard?: (user: User) => void
}

const INFO_ITEMS = [
  { icon: '📍', label: '住まい',       value: '東京都' },
  { icon: '💼', label: '職業',         value: 'デザイナー' },
  { icon: '☕', label: '休日の過ごし方', value: 'カフェでのんびり' },
  { icon: '🎬', label: '理想のデート',  value: '映画鑑賞とディナー' },
]

const BIO_LIMIT = 120

export const ProfileDetail = ({ user, onBack, onOpenBoard }: ProfileDetailProps) => {
  const allImages = [user.image, ...(user.subImages ?? [])]
  const [currentIdx, setCurrentIdx] = useState(0)
  const [bioExpanded, setBioExpanded] = useState(false)
  const bioNeedsToggle = user.bio.length > BIO_LIMIT

  return (
    <div className="profile-detail-modal" onClick={onBack}>
      <div className="profile-detail-container" onClick={e => e.stopPropagation()}>

        {/* ギャラリー */}
        <div className="pd-hero">
          <img src={allImages[currentIdx]} alt={user.name} className="pd-hero-img" />
          <button className="pd-close" onClick={onBack}>✕</button>

          {/* ドットインジケーター */}
          {allImages.length > 1 && (
            <div className="pd-dots">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  className={`pd-dot ${i === currentIdx ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); setCurrentIdx(i) }}
                />
              ))}
            </div>
          )}

          {/* 左右タップ領域 */}
          {currentIdx > 0 && (
            <button className="pd-nav pd-nav-prev" onClick={e => { e.stopPropagation(); setCurrentIdx(i => i - 1) }}>‹</button>
          )}
          {currentIdx < allImages.length - 1 && (
            <button className="pd-nav pd-nav-next" onClick={e => { e.stopPropagation(); setCurrentIdx(i => i + 1) }}>›</button>
          )}
        </div>

        {/* サムネイル行 */}
        {allImages.length > 1 && (
          <div className="pd-thumbnails">
            {allImages.map((img, i) => (
              <button
                key={i}
                className={`pd-thumb ${i === currentIdx ? 'active' : ''}`}
                onClick={() => setCurrentIdx(i)}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}

        {/* バッジ行 */}
        <div className="pd-badges">
          <span className="pd-badge">🚃 {user.line}</span>
          <span className="pd-badge">{getDistanceLabel(user.distanceKm)}</span>
        </div>

        {/* 名前・年齢 */}
        <div className="pd-name-row">
          <h2 className="pd-name">{user.name}</h2>
          <span className="pd-age">{user.age}歳</span>
        </div>

        {/* 自己紹介 */}
        <div className="pd-section">
          <h3 className="pd-section-title">自己紹介</h3>
          <p className={`pd-bio${bioNeedsToggle && !bioExpanded ? ' collapsed' : ''}`}>{user.bio}</p>
          {bioNeedsToggle && (
            <button className="pd-bio-toggle" onClick={() => setBioExpanded(v => !v)}>
              {bioExpanded ? '閉じる ▲' : 'もっと見る ▼'}
            </button>
          )}
        </div>

        {/* プロフィール情報グリッド */}
        <div className="pd-section">
          <h3 className="pd-section-title">プロフィール</h3>
          <div className="pd-info-grid">
            {INFO_ITEMS.map(item => (
              <div key={item.label} className="pd-info-item">
                <span className="pd-info-icon">{item.icon}</span>
                <div className="pd-info-text">
                  <span className="pd-info-label">{item.label}</span>
                  <span className="pd-info-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ボタン群 */}
        <div className="pd-actions">
          {onOpenBoard && (
            <button className="pd-board-btn" onClick={() => onOpenBoard(user)}>
              📋 掲示板を見る
            </button>
          )}
          <button className="pd-back-btn" onClick={onBack}>閉じる</button>
        </div>

      </div>
    </div>
  )
}
