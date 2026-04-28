import { useState } from 'react'
import { mockBoardPosts, BoardPost } from '../../../data/reviewBoard'

export const ReviewBoard = () => {
  const [posts, setPosts] = useState<BoardPost[]>(mockBoardPosts)
  const [reacted, setReacted] = useState<Record<number, 'helpful' | 'agree'>>({})
  const [activeType, setActiveType] = useState<'all' | 'good' | 'warning'>('all')

  const react = (id: number, type: 'helpful' | 'agree') => {
    if (reacted[id]) return
    setReacted(prev => ({ ...prev, [id]: type }))
    setPosts(prev => prev.map(p => p.id === id ? { ...p, [type]: p[type] + 1 } : p))
  }

  const filtered = activeType === 'all' ? posts : posts.filter(p => p.type === activeType)

  return (
    <div className="review-board">
      <div className="review-board-filters">
        {(['all', 'good', 'warning'] as const).map(t => (
          <button
            key={t}
            className={`review-board-filter ${activeType === t ? 'active' : ''}`}
            onClick={() => setActiveType(t)}
          >
            {t === 'all' ? 'すべて' : t === 'good' ? '✨ 神ユーザー' : '⚠️ 要注意'}
          </button>
        ))}
      </div>

      <div className="review-board-list">
        {filtered.map(post => (
          <div key={post.id} className={`review-board-card ${post.type}`}>
            <div className="review-board-badge">
              {post.type === 'good' ? '✨ 神ユーザー体験' : '⚠️ 要注意情報（運営確認済み）'}
            </div>
            <p className="review-board-content">{post.content}</p>
            <div className="review-board-reactions">
              <button
                className={`reaction-btn ${reacted[post.id] === 'helpful' ? 'reacted' : ''}`}
                onClick={() => react(post.id, 'helpful')}
                disabled={!!reacted[post.id]}
              >
                👍 助かった {post.helpful}
              </button>
              <button
                className={`reaction-btn ${reacted[post.id] === 'agree' ? 'reacted' : ''}`}
                onClick={() => react(post.id, 'agree')}
                disabled={!!reacted[post.id]}
              >
                🤝 同感 {post.agree}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
