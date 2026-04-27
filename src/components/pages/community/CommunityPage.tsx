import { useState } from 'react'
import { mockCommunities, ALL_TAGS } from '../../../mocks/communities'
import { Community } from '../../../types/community'
import { useCommunity } from '../../../contexts/CommunityContext'
import { CommunityDetail } from './CommunityDetail'

export const CommunityPage = () => {
  const { isJoined, join, leave } = useCommunity()
  const [activeTag, setActiveTag] = useState<string>('')
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)

  const filtered = activeTag
    ? mockCommunities.filter(c => c.tag === activeTag)
    : mockCommunities

  return (
    <div className="community-page">
      <div className="community-page-header">
        <h2>コミュニティ</h2>
        <p>タグを選んで仲間のいるコミュニティに参加しよう</p>
      </div>

      <div className="tag-filter-bar">
        <button
          className={`tag-chip ${activeTag === '' ? 'active' : ''}`}
          onClick={() => setActiveTag('')}
        >
          すべて
        </button>
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            className={`tag-chip ${activeTag === tag ? 'active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="community-grid">
        {filtered.map(community => {
          const joined = isJoined(community.id)
          return (
            <div
              key={community.id}
              className="community-card"
              onClick={() => setSelectedCommunity(community)}
            >
              {joined && <span className="community-joined-badge">参加中</span>}
              <div className="community-card-emoji">{community.emoji}</div>
              <div className="community-card-body">
                <h3 className="community-card-name">{community.name}</h3>
                <p className="community-card-desc">{community.description}</p>
                <div className="community-card-footer">
                  <span className="community-card-tag">{community.tag}</span>
                  <span className="community-card-members">👥 {community.memberCount.toLocaleString()}</span>
                </div>
              </div>
              <button
                className={`community-card-join-btn ${joined ? 'joined' : ''}`}
                onClick={e => {
                  e.stopPropagation()
                  joined ? leave(community.id) : join(community.id)
                }}
              >
                {joined ? '参加中' : '参加する'}
              </button>
            </div>
          )
        })}
      </div>

      {selectedCommunity && (
        <CommunityDetail
          community={selectedCommunity}
          onClose={() => setSelectedCommunity(null)}
        />
      )}
    </div>
  )
}
