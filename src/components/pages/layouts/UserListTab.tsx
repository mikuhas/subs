import { User } from '../../../types/user'

interface UserListTabProps {
  users: User[]
  title: string
  onRemove: (id: number) => void
  onProfileClick: (user: User) => void
}

export const UserListTab = ({
  users,
  title,
  onRemove,
  onProfileClick,
}: UserListTabProps) => {
  return (
    <div className="list-container">
      <h2>{title}</h2>
      {users.length === 0 ? (
        <div className="empty-message">
          {title.includes('いいね')
            ? 'まだいいねした相手がいません'
            : 'まだスキップした相手がいません'}
        </div>
      ) : (
        <div className="user-list">
          {users.map((user) => (
            <div key={user.id} className="user-list-item">
              <img src={user.image} alt={user.name} className="list-image" onClick={() => onProfileClick(user)} />
              <div className="user-info">
                <h4>{user.name}</h4>
                <p className="age-small">{user.age}歳</p>
                <p className="bio-small">{user.bio}</p>
              </div>
              <button
                className="remove-button"
                onClick={() => onRemove(user.id)}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
