import { useState } from 'react'
import { User } from '../../types/user'
import { getDistanceLabel } from '../../utils/distance'

interface ProfileCardProps {
  user: User | null
  hasSearched: boolean
  onLike: () => void
  onSkip: () => void
  onProfileClick: (user: User) => void
}

export const ProfileCard = ({
  user,
  hasSearched,
  onLike,
  onSkip,
  onProfileClick,
}: ProfileCardProps) => {
  const [animDir, setAnimDir] = useState<'like' | 'skip' | null>(null)

  const handleLike = () => { if (!animDir) setAnimDir('like') }
  const handleSkip = () => { if (!animDir) setAnimDir('skip') }

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (!e.animationName.startsWith('card-swipe')) return
    if (animDir === 'like') onLike()
    else if (animDir === 'skip') onSkip()
    setAnimDir(null)
  }

  if (!user) {
    if (!hasSearched) return null
    return <div className="no-result">条件に合う相手が見つかりませんでした</div>
  }

  return (
    <div
      className={`profile-card-wrap${animDir ? ` card-swipe-${animDir}` : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {animDir === 'like' && <span className="card-stamp card-stamp-like">LIKE ♥</span>}
      {animDir === 'skip' && <span className="card-stamp card-stamp-skip">SKIP</span>}

      <div key={user.id} className="profile-card">
        <div className="profile-image-area" onClick={() => onProfileClick(user)}>
          <img src={user.image} alt={user.name} className="profile-image" />
        </div>
        <div className="profile-info">
          <h3>{user.name}</h3>
          <p className="age">{user.age}歳</p>
          <p className="line-badge"><i className="ri-subway-line"></i> {user.line}</p>
          <p className="distance-badge">{getDistanceLabel(user.distanceKm)}</p>
          <p className="bio">{user.bio}</p>
          <div className="button-group">
            <button className="action-button like" onClick={handleLike} disabled={!!animDir}>
              <i className="ri-heart-fill"></i> いいね
            </button>
            <button className="action-button skip" onClick={handleSkip} disabled={!!animDir}>
              <i className="ri-arrow-right-line"></i> スキップ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
