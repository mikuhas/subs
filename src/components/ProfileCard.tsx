import { User } from '../types/user'

interface ProfileCardProps {
  user: User | null
  myAge: number | ''
  onLike: () => void
  onSkip: () => void
  onProfileClick: (user: User) => void
}

export const ProfileCard = ({
  user,
  myAge,
  onLike,
  onSkip,
  onProfileClick,
}: ProfileCardProps) => {
  if (!user) {
    if (myAge === '') return null

    return (
      <div className="no-result">まだ相手が見つかっていません</div>
    )
  }

  return (
    <div className="profile-card">
      <img src={user.image} alt={user.name} className="profile-image" onClick={() => onProfileClick(user)} />
      <h3>{user.name}</h3>
      <p className="age">{user.age}歳</p>
      <p className="bio">{user.bio}</p>
      <div className="button-group">
        <button className="action-button like" onClick={onLike}>
          いいね
        </button>
        <button className="action-button skip" onClick={onSkip}>
          スキップ
        </button>
      </div>
    </div>
  )
}
