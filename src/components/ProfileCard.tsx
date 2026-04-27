import { User } from '../types/user'

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
  if (!user) {
    if (!hasSearched) return null
    return <div className="no-result">条件に合う相手が見つかりませんでした</div>
  }

  return (
    <div className="profile-card">
      <div className="profile-image-area" onClick={() => onProfileClick(user)}>
        <img src={user.image} alt={user.name} className="profile-image" />
      </div>
      <div className="profile-info">
        <h3>{user.name}</h3>
        <p className="age">{user.age}歳</p>
        <p className="line-badge">🚃 {user.line}</p>
        <p className="bio">{user.bio}</p>
        <div className="button-group">
          <button className="action-button like" onClick={onLike}>❤️ いいね</button>
          <button className="action-button skip" onClick={onSkip}>⏩ スキップ</button>
        </div>
      </div>
    </div>
  )
}
