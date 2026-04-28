import { useState } from 'react'
import { User } from '../../../types/user'
import { useReview } from '../../../contexts/ReviewContext'
import { getDistanceLabel } from '../../../utils/distance'

const MOCK_POSTS_BY_USER: Record<number, { type: 'good' | 'warning'; content: string }[]> = {
  1: [
    { type: 'good', content: '約束の時間より早く来てくれて、とても誠実な方でした。話もとても楽しかったです。' },
    { type: 'good', content: '趣味の話で盛り上がり、時間を忘れるくらい楽しいひとときでした。' },
  ],
  2: [
    { type: 'good', content: 'カフェ選びのセンスが抜群で、素敵なお店に連れて行ってもらいました。' },
  ],
  3: [
    { type: 'good', content: 'とても落ち着いた雰囲気で、リラックスして話せました。また会いたいです。' },
    { type: 'warning', content: 'メッセージの返信が遅めです。急いでいる方は事前に伝えておくといいかも（運営確認済み）。' },
  ],
  4: [
    { type: 'good', content: '映画についての知識が豊富で、おすすめを色々教えてもらいました。' },
  ],
  5: [
    { type: 'good', content: '旅行の話が尽きなくて楽しかったです。プロフィール通りの方でした。' },
    { type: 'good', content: '礼儀正しくて安心してデートができました。' },
  ],
}

const CATEGORY_LABELS: Record<string, string> = {
  sincerity: '誠実さ',
  match: '一致度',
  safety: '安心感',
}

interface UserBoardPageProps {
  user: User
  onBack: () => void
}

export const UserBoardPage = ({ user, onBack }: UserBoardPageProps) => {
  const { getReviewsForUser } = useReview()
  const [reacted, setReacted] = useState<Record<number, 'helpful' | 'agree'>>({})
  const [reactions, setReactions] = useState<Record<number, { helpful: number; agree: number }>>({})

  const submittedReviews = getReviewsForUser(user.id)
  const mockPosts = MOCK_POSTS_BY_USER[user.id] ?? []

  const react = (idx: number, type: 'helpful' | 'agree') => {
    if (reacted[idx]) return
    setReacted(prev => ({ ...prev, [idx]: type }))
    setReactions(prev => ({
      ...prev,
      [idx]: { helpful: (prev[idx]?.helpful ?? 0) + (type === 'helpful' ? 1 : 0), agree: (prev[idx]?.agree ?? 0) + (type === 'agree' ? 1 : 0) },
    }))
  }

  const avgRating = submittedReviews.length > 0
    ? Object.keys(CATEGORY_LABELS).map(key => {
        const avg = submittedReviews.reduce((s, r) => s + r.ratings[key as keyof typeof r.ratings], 0) / submittedReviews.length
        return { key, avg }
      })
    : null

  return (
    <div className="userboard-page">
      <button className="fitcheck-back-btn" onClick={onBack}>← 戻る</button>

      <div className="userboard-header">
        <img src={user.image} alt={user.name} className="userboard-avatar" />
        <div>
          <h2 className="userboard-name">{user.name}</h2>
          <p className="userboard-sub">{user.age}歳 · {getDistanceLabel(user.distanceKm)}</p>
        </div>
      </div>

      {avgRating && (
        <div className="userboard-ratings">
          <h3>みんなの評価 <span className="userboard-review-count">{submittedReviews.length}件</span></h3>
          <div className="userboard-rating-grid">
            {avgRating.map(({ key, avg }) => (
              <div key={key} className="userboard-rating-item">
                <span className="userboard-rating-label">{CATEGORY_LABELS[key]}</span>
                <div className="userboard-rating-stars">
                  {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} className={`userboard-star ${avg >= n ? 'filled' : avg >= n - 0.5 ? 'half' : ''}`}>★</span>
                  ))}
                </div>
                <span className="userboard-rating-num">{avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
          {submittedReviews[0].tags.length > 0 && (
            <div className="userboard-tags">
              {submittedReviews.flatMap(r => r.tags)
                .filter((t, i, a) => a.indexOf(t) === i)
                .map(tag => (
                  <span key={tag} className="userboard-tag">{tag}</span>
                ))}
            </div>
          )}
          {submittedReviews.some(r => r.comment) && (
            <div className="userboard-comments">
              <p className="userboard-comments-title">コメント</p>
              {submittedReviews.filter(r => r.comment).map((r, i) => (
                <div key={i} className="userboard-comment-item">
                  <p className="userboard-comment-text">"{r.comment}"</p>
                  <p className="userboard-comment-date">{new Date(r.timestamp).toLocaleDateString('ja-JP')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="userboard-posts">
        <h3>みんなの投稿 ({mockPosts.length}件)</h3>
        {mockPosts.length === 0 ? (
          <p className="mypage-empty-note">まだ投稿がありません</p>
        ) : (
          mockPosts.map((post, i) => (
            <div key={i} className={`review-board-card ${post.type}`}>
              <div className="review-board-badge">
                {post.type === 'good' ? '✨ 体験談' : '⚠️ 注意情報（運営確認済み）'}
              </div>
              <p className="review-board-content">{post.content}</p>
              <div className="review-board-reactions">
                <button
                  className={`reaction-btn ${reacted[i] === 'helpful' ? 'reacted' : ''}`}
                  onClick={() => react(i, 'helpful')}
                  disabled={!!reacted[i]}
                >
                  👍 助かった {reactions[i]?.helpful ?? 0}
                </button>
                <button
                  className={`reaction-btn ${reacted[i] === 'agree' ? 'reacted' : ''}`}
                  onClick={() => react(i, 'agree')}
                  disabled={!!reacted[i]}
                >
                  🤝 同感 {reactions[i]?.agree ?? 0}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
