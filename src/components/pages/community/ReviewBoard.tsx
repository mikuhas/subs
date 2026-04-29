import { useState } from 'react'
import { mockBoardPosts, BoardPost } from '../../../data/reviewBoard'

const NG_WORDS = [
  'バカ', 'ばか', '馬鹿', 'アホ', 'あほ', '死ね', 'しね', 'クソ', 'くそ',
  '糞', 'キモい', 'きもい', 'ウザい', 'うざい', '殺す', 'ころす',
  '詐欺', 'さぎ', '勧誘', 'かんゆう', 'ライン', 'LINE', 'line',
  '連絡先', 'メアド', '電話番号', '個人情報',
]

function containsNgWord(text: string): string | null {
  for (const word of NG_WORDS) {
    if (text.includes(word)) return word
  }
  return null
}

export const ReviewBoard = () => {
  const [posts, setPosts] = useState<BoardPost[]>(mockBoardPosts)
  const [reacted, setReacted] = useState<Record<number, 'helpful' | 'agree'>>({})
  const [activeType, setActiveType] = useState<'all' | 'good' | 'warning'>('all')
  const [showForm, setShowForm] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState<'good' | 'warning'>('good')
  const [ngError, setNgError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const react = (id: number, type: 'helpful' | 'agree') => {
    if (reacted[id]) return
    setReacted(prev => ({ ...prev, [id]: type }))
    setPosts(prev => prev.map(p => p.id === id ? { ...p, [type]: p[type] + 1 } : p))
  }

  const handleSubmit = () => {
    const trimmed = newContent.trim()
    if (!trimmed) return

    const hit = containsNgWord(trimmed)
    if (hit) {
      setNgError(`「${hit}」はNGワードのため投稿できません`)
      return
    }

    const newPost: BoardPost = {
      id: Date.now(),
      type: newType,
      content: trimmed,
      helpful: 0,
      agree: 0,
    }
    setPosts(prev => [newPost, ...prev])
    setNewContent('')
    setNgError(null)
    setShowForm(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
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

      {submitted && (
        <div className="ng-success-message">投稿しました！</div>
      )}

      <div className="review-board-post-area">
        {!showForm ? (
          <button className="review-board-new-btn" onClick={() => setShowForm(true)}>
            ＋ 体験を投稿する
          </button>
        ) : (
          <div className="review-board-form">
            <div className="review-board-form-type">
              <button
                className={`review-type-btn ${newType === 'good' ? 'active-good' : ''}`}
                onClick={() => setNewType('good')}
              >
                ✨ 神ユーザー体験
              </button>
              <button
                className={`review-type-btn ${newType === 'warning' ? 'active-warning' : ''}`}
                onClick={() => setNewType('warning')}
              >
                ⚠️ 要注意情報
              </button>
            </div>
            <textarea
              className="review-board-textarea"
              placeholder="体験を共有してください（NGワードを含む投稿はブロックされます）"
              value={newContent}
              onChange={e => { setNewContent(e.target.value); setNgError(null) }}
              rows={4}
            />
            {ngError && <p className="ng-error-message">{ngError}</p>}
            <div className="review-board-form-actions">
              <button className="review-board-submit-btn" onClick={handleSubmit}>投稿する</button>
              <button className="review-board-cancel-btn" onClick={() => { setShowForm(false); setNgError(null); setNewContent('') }}>キャンセル</button>
            </div>
          </div>
        )}
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
