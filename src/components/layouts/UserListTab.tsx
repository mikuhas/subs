import { User } from '../../types/user'
import { getDistanceLabel } from '../../utils/distance'

interface UserListTabProps {
  users: User[]
  title: string
  showMessageButton?: boolean
  onRemove: (id: number) => void
  onProfileClick: (user: User) => void
  onMessage?: (user: User) => void
}

export const UserListTab = ({
  users,
  title,
  showMessageButton,
  onRemove,
  onProfileClick,
  onMessage,
}: UserListTabProps) => {
  return (
    <div className="list-container">
      <h2>{title}</h2>
      {users.length === 0 ? (
        <div className="empty-message">
          {title.includes('いいね') ? 'まだいいねした相手がいません' : 'まだスキップした相手がいません'}
        </div>
      ) : (
        <div className="user-list">
          {users.map(user => (
            <div key={user.id} className="user-list-item">
              <img
                src={user.image}
                alt={user.name}
                className="list-image"
                onClick={() => onProfileClick(user)}
              />
              <div className="user-info">
                <h4>{user.name}</h4>
                <p className="age-small">{user.age}歳 · {user.line} · {getDistanceLabel(user.distanceKm)}</p>
                <p className="bio-small">{user.bio}</p>
              </div>
              <div className="user-list-actions">
                {showMessageButton && onMessage && (
                  <button className="message-button" onClick={() => onMessage(user)}>💬</button>
                )}
                <button className="remove-button" onClick={() => onRemove(user.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
