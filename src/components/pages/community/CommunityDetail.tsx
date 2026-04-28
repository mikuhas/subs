import { Community } from '../../../types/community'
import { mockUsers } from '../../../data/users'
import { useCommunity } from '../../../contexts/CommunityContext'

interface CommunityDetailProps {
  community: Community
  onClose: () => void
}

const getMembers = (communityId: number) => {
  const offset = ((communityId - 1) * 7) % mockUsers.length
  const result: typeof mockUsers = []
  for (let i = 0; i < 12; i++) {
    result.push(mockUsers[(offset + i) % mockUsers.length])
  }
  return result
}

export const CommunityDetail = ({ community, onClose }: CommunityDetailProps) => {
  const { isJoined, join, leave } = useCommunity()
  const joined = isJoined(community.id)
  const members = getMembers(community.id)

  return (
    <div className="community-modal-overlay" onClick={onClose}>
      <div className="community-detail-container" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="community-detail-header">
          <div className="community-detail-emoji">{community.emoji}</div>
          <div>
            <span className="community-tag-badge">{community.tag}</span>
            <h2>{community.name}</h2>
            <p className="community-detail-desc">{community.description}</p>
            <p className="community-member-count">👥 {community.memberCount.toLocaleString()}人が参加中</p>
          </div>
        </div>

        <div className="community-detail-actions">
          <button
            className={`community-join-btn ${joined ? 'joined' : ''}`}
            onClick={() => joined ? leave(community.id) : join(community.id)}
          >
            {joined ? '✓ 参加中（タップで脱退）' : 'コミュニティに参加する'}
          </button>
        </div>

        <div className="community-members-section">
          <h3>メンバー</h3>
          <div className="community-members-grid">
            {members.map(user => (
              <div key={user.id} className="community-member-item">
                <img src={user.image} alt={user.name} />
                <span>{user.name.split('').slice(0, 3).join('')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
