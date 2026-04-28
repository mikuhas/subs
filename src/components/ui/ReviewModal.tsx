import { useState } from 'react'
import { User } from '../../types/user'
import { useReview } from '../../contexts/ReviewContext'

const POSITIVE_TAGS = ['聞き上手', '写真より素敵', '礼儀正しい', '楽しかった', 'また会いたい', '時間を守る']
const NEGATIVE_TAGS = ['返信が遅い', '写真と違う', '約束を守らない', '失礼だった', 'ドタキャンされた']

const CATEGORIES = [
  { key: 'sincerity', label: '誠実さ', desc: '返信速度・態度の適切さ' },
  { key: 'match',     label: '一致度',  desc: '写真・プロフィールと実物の近さ' },
  { key: 'safety',    label: '安心感',  desc: '威圧感・不快な言動の有無' },
] as const

type CategoryKey = (typeof CATEGORIES)[number]['key']

interface ReviewModalProps {
  user: User
  onClose: () => void
  onSubmit: () => void
}

export const ReviewModal = ({ user, onClose, onSubmit }: ReviewModalProps) => {
  const { addReview } = useReview()
  const [ratings, setRatings] = useState<Record<CategoryKey, number>>({ sincerity: 0, match: 0, safety: 0 })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const canSubmit = Object.values(ratings).every(r => r > 0) && selectedTags.length > 0

  const handleSubmit = () => {
    addReview({ userId: user.id, ratings, tags: selectedTags, comment: comment.trim(), timestamp: Date.now() })
    setSubmitted(true)
    setTimeout(() => { onSubmit(); onClose() }, 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="review-submitted">
            <div style={{ fontSize: '3rem' }}>✅</div>
            <p>レビューを送信しました</p>
            <p className="review-submitted-note">1週間後に匿名で本人へ通知されます</p>
          </div>
        ) : (
          <>
            <div className="review-modal-header">
              <img src={user.image} alt={user.name} className="review-modal-avatar" />
              <div>
                <h3>{user.name}さんへのレビュー</h3>
                <p className="review-modal-note">内容は匿名で1週間後に通知されます</p>
              </div>
              <button className="modal-close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="review-categories">
              {CATEGORIES.map(cat => (
                <div key={cat.key} className="review-category">
                  <div className="review-category-label">
                    <span>{cat.label}</span>
                    <span className="review-category-desc">{cat.desc}</span>
                  </div>
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        className={`review-star ${ratings[cat.key] >= n ? 'filled' : ''}`}
                        onClick={() => setRatings(prev => ({ ...prev, [cat.key]: n }))}
                      >★</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="review-tags-section">
              <p className="review-tags-label">当てはまるタグを選択（必須）</p>
              <div className="review-tags positive">
                {POSITIVE_TAGS.map(tag => (
                  <button
                    key={tag}
                    className={`review-tag positive ${selectedTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >{tag}</button>
                ))}
              </div>
              <div className="review-tags negative">
                {NEGATIVE_TAGS.map(tag => (
                  <button
                    key={tag}
                    className={`review-tag negative ${selectedTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >{tag}</button>
                ))}
              </div>
            </div>

            <div className="review-comment-section">
              <p className="review-tags-label">コメント（任意）</p>
              <textarea
                className="review-comment-input"
                placeholder="相手への感想を自由に書いてください"
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={200}
              />
              <p className="review-comment-count">{comment.length}/200</p>
            </div>

            <button
              className="review-submit-btn"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              レビューを送信する
            </button>
          </>
        )}
      </div>
    </div>
  )
}
