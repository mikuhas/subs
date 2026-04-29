import { useState, useRef } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useCommunity } from '../../../contexts/CommunityContext'
import { Profile } from '../../../types/profile'
import { User } from '../../../types/user'
import { useRailwayLines } from '../../../composables/useRailwayLines'
import { mockCommunities } from '../../../data/communities'

const BODY_TYPES = ['スリム', '普通', 'がっちり', 'ぽっちゃり', '筋肉質']

const TOKYO_MEETING_AREAS = [
  '渋谷・原宿', '新宿・代々木', '池袋', '上野・浅草',
  '秋葉原・神田', '銀座・有楽町', '品川・五反田',
  '六本木・麻布', '恵比寿・代官山', '吉祥寺・三鷹',
  '錦糸町・押上', '豊洲・お台場', '下北沢', '高円寺・中野',
  '目黒・中目黒', '自由が丘', '二子玉川', '赤羽・王子',
  '立川・国分寺', '八王子',
]

const AVATAR_OPTIONS = [
  'https://randomuser.me/api/portraits/lego/9.jpg',
  'https://randomuser.me/api/portraits/lego/1.jpg',
  'https://randomuser.me/api/portraits/lego/2.jpg',
  'https://randomuser.me/api/portraits/lego/3.jpg',
  'https://randomuser.me/api/portraits/lego/4.jpg',
  'https://randomuser.me/api/portraits/lego/5.jpg',
]

const GENDER_LABEL: Record<string, string> = { mens: 'メンズ', womens: 'レディース', kids: 'キッズ' }

interface MyPageProps {
  likedUsers: User[]
  skippedUsers: User[]
  onRemoveLiked: (id: number) => void
  onRemoveSkipped: (id: number) => void
  onProfileClick: (user: User) => void
  onOpenFitCheck: () => void
}

export const MyPage = ({ likedUsers, skippedUsers, onRemoveLiked, onRemoveSkipped, onProfileClick, onOpenFitCheck }: MyPageProps) => {
  const { profile, logout, updateProfile } = useAuth()
  const { joinedIds, leave } = useCommunity()
  const [isEditing, setIsEditing] = useState(false)
  const [showLikedHistory, setShowLikedHistory] = useState(false)
  const [showSkippedHistory, setShowSkippedHistory] = useState(false)
  const [editForm, setEditForm] = useState<Profile | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { lines, loading: linesLoading, error: linesError } = useRailwayLines()
  const joinedCommunities = mockCommunities.filter(c => joinedIds.includes(c.id))

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setUploadedImages(prev => [...prev, dataUrl])
        setEditForm(f => f ? { ...f, image: dataUrl } : f)
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleEditStart = () => {
    if (profile) { setEditForm({ ...profile }); setIsEditing(true) }
  }

  const handleSave = () => {
    if (editForm) { updateProfile(editForm); setIsEditing(false); setEditForm(null) }
  }

  const handleCancel = () => { setIsEditing(false); setEditForm(null) }

  const set = <K extends keyof Profile>(key: K, val: Profile[K]) =>
    setEditForm(f => f ? { ...f, [key]: val } : f)

  const likedCount = likedUsers.length
  const skippedCount = skippedUsers.length
  const matchRate = likedCount + skippedCount > 0
    ? Math.round((likedCount / (likedCount + skippedCount)) * 100) : 0

  return (
    <div className="mypage-container">
      <h2>マイページ</h2>

      {/* ── プロフィールカード ── */}
      <div className="mpe-card">
        {isEditing ? (
          /* 編集モード */
          <>
            {/* ヒーロー写真 */}
            <div className="pd-hero">
              <img src={editForm?.image} alt="プロフィール" className="pd-hero-img" />
            </div>

            {/* フォト選択 */}
            <div className="mpe-photo-picker">
              {[...AVATAR_OPTIONS, ...uploadedImages].map(url => (
                <button
                  key={url}
                  className={`pd-thumb ${editForm?.image === url ? 'active' : ''}`}
                  onClick={() => set('image', url)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
              <button className="pd-thumb mpe-upload-btn" onClick={() => fileInputRef.current?.click()} title="写真をアップロード">
                <span>＋</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
            </div>

            {/* 名前・年齢 */}
            <div className="mpe-name-row">
              <input
                className="mpe-name-input"
                type="text"
                placeholder="名前"
                value={editForm?.name ?? ''}
                onChange={e => set('name', e.target.value)}
              />
              <input
                className="mpe-age-input"
                type="number"
                min="18"
                max="99"
                value={editForm?.age ?? ''}
                onChange={e => set('age', Number(e.target.value))}
              />
              <span className="mpe-age-unit">歳</span>
            </div>

            {/* 自己紹介 */}
            <div className="pd-section">
              <h3 className="pd-section-title">自己紹介</h3>
              <textarea
                className="mpe-textarea"
                placeholder="自己紹介を入力..."
                value={editForm?.bio ?? ''}
                onChange={e => set('bio', e.target.value)}
              />
            </div>

            {/* プロフィール詳細 */}
            <div className="pd-section">
              <h3 className="pd-section-title">プロフィール</h3>
              <div className="mpe-field-list">

                <div className="mpe-field-item">
                  <span className="mpe-field-icon">🚃</span>
                  <div className="mpe-field-body">
                    <label className="mpe-field-label">
                      好きな沿線
                      {linesError && <span className="field-note">（オフライン）</span>}
                    </label>
                    <select
                      className="mpe-field-select"
                      value={editForm?.preferredLine ?? ''}
                      onChange={e => set('preferredLine', e.target.value)}
                      disabled={linesLoading}
                    >
                      <option value="">{linesLoading ? '読み込み中...' : '選択してください'}</option>
                      {lines.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mpe-field-item">
                  <span className="mpe-field-icon">📍</span>
                  <div className="mpe-field-body">
                    <label className="mpe-field-label">出会いたいエリア</label>
                    <select
                      className="mpe-field-select"
                      value={editForm?.preferredMeetingArea ?? ''}
                      onChange={e => set('preferredMeetingArea', e.target.value)}
                    >
                      <option value="">選択してください</option>
                      {TOKYO_MEETING_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mpe-field-item">
                  <span className="mpe-field-icon">📏</span>
                  <div className="mpe-field-body">
                    <label className="mpe-field-label">身長</label>
                    <div className="mpe-inline">
                      <input
                        className="mpe-field-select mpe-height-input"
                        type="number"
                        min="140"
                        max="210"
                        placeholder="例: 170"
                        value={editForm?.height ?? ''}
                        onChange={e => set('height', e.target.value ? Number(e.target.value) : undefined)}
                      />
                      <span className="mpe-unit">cm</span>
                    </div>
                  </div>
                </div>

                <div className="mpe-field-item">
                  <span className="mpe-field-icon">👤</span>
                  <div className="mpe-field-body">
                    <label className="mpe-field-label">体型</label>
                    <select
                      className="mpe-field-select"
                      value={editForm?.bodyType ?? ''}
                      onChange={e => set('bodyType', e.target.value || undefined)}
                    >
                      <option value="">選択してください</option>
                      {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* マッチング設定 */}
            <div className="pd-section">
              <h3 className="pd-section-title">マッチング設定</h3>
              <div className="mpe-field-list">
                <div className="mpe-field-item">
                  <span className="mpe-field-icon">💞</span>
                  <div className="mpe-field-body">
                    <label className="mpe-field-label">ランダムマッチ</label>
                    <button
                      type="button"
                      className={`random-match-toggle ${editForm?.randomMatchEnabled !== false ? 'on' : 'off'}`}
                      onClick={() => set('randomMatchEnabled', !(editForm?.randomMatchEnabled !== false))}
                    >
                      {editForm?.randomMatchEnabled !== false ? '✅ 対象に含める' : '🚫 対象から外す'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 保存・キャンセル */}
            <div className="mpe-actions">
              <button className="mpe-save-btn" onClick={handleSave}>保存</button>
              <button className="mpe-cancel-btn" onClick={handleCancel}>キャンセル</button>
            </div>
          </>
        ) : (
          /* 閲覧モード */
          <>
            <div className="pd-hero">
              <img src={profile?.image} alt="マイプロフィール" className="pd-hero-img" />
            </div>

            <div className="pd-name-row">
              <h2 className="pd-name">{profile?.name || '未設定'}</h2>
              {profile?.age && <span className="pd-age">{profile.age}歳</span>}
            </div>

            {profile?.bio && (
              <div className="pd-section">
                <h3 className="pd-section-title">自己紹介</h3>
                <p className="pd-bio">{profile.bio}</p>
              </div>
            )}

            <div className="pd-section">
              <h3 className="pd-section-title">プロフィール</h3>
              <div className="pd-info-grid">
                {[
                  { icon: '⚧️', label: '性別',          value: profile?.gender ? GENDER_LABEL[profile.gender] : undefined },
                  { icon: '🚃', label: '好きな沿線',     value: profile?.preferredLine },
                  { icon: '📍', label: '出会いたいエリア', value: profile?.preferredMeetingArea },
                  { icon: '📏', label: '身長',           value: profile?.height ? `${profile.height}cm` : undefined },
                  { icon: '👤', label: '体型',           value: profile?.bodyType },
                  { icon: '💞', label: 'ランダムマッチ',  value: profile?.randomMatchEnabled !== false ? '対象に含める' : '対象から外す' },
                  { icon: '📧', label: 'メール',         value: profile?.email },
                ].filter(({ value }) => !!value).map(({ icon, label, value }) => (
                  <div key={label} className="pd-info-item">
                    <span className="pd-info-icon">{icon}</span>
                    <div className="pd-info-text">
                      <span className="pd-info-label">{label}</span>
                      <span className="pd-info-value">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pd-actions">
              <button className="mpe-edit-btn" onClick={handleEditStart}>✏️ プロフィールを編集</button>
            </div>
          </>
        )}
      </div>

      {/* ── マッチング統計 ── */}
      <div className="mypage-stats">
        <h3>マッチング統計</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{likedCount}</div>
            <div className="stat-label">いいねした数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{skippedCount}</div>
            <div className="stat-label">スキップ数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{matchRate}%</div>
            <div className="stat-label">いいね率</div>
          </div>
        </div>
      </div>

      {/* ── 参加コミュニティ ── */}
      <div className="mypage-communities">
        <h3>参加中のコミュニティ</h3>
        {joinedCommunities.length === 0 ? (
          <p className="mypage-empty-note">まだコミュニティに参加していません</p>
        ) : (
          <div className="mypage-community-list">
            {joinedCommunities.map(c => (
              <div key={c.id} className="mypage-community-item">
                <span className="mypage-community-emoji">{c.emoji}</span>
                <span className="mypage-community-name">{c.name}</span>
                <button className="mypage-community-leave" onClick={() => leave(c.id)}>脱退</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── いいね履歴 ── */}
      <div className="mypage-history">
        <div className="mypage-history-header" onClick={() => setShowLikedHistory(v => !v)}>
          <h3>❤️ いいね履歴 ({likedCount})</h3>
          <span className="mypage-history-toggle">{showLikedHistory ? '▲' : '▼'}</span>
        </div>
        {showLikedHistory && (
          likedUsers.length === 0
            ? <p className="mypage-empty-note">いいねした相手がいません</p>
            : <div className="mypage-history-list">
                {likedUsers.map(user => (
                  <div key={user.id} className="mypage-history-item">
                    <img src={user.image} alt={user.name} className="mypage-history-avatar" onClick={() => onProfileClick(user)} />
                    <div className="mypage-history-info">
                      <span className="mypage-history-name">{user.name}</span>
                      <span className="mypage-history-sub">{user.age}歳 · {user.line}</span>
                    </div>
                    <button className="remove-button" onClick={() => onRemoveLiked(user.id)}>削除</button>
                  </div>
                ))}
              </div>
        )}
      </div>

      {/* ── スキップ履歴 ── */}
      <div className="mypage-history">
        <div className="mypage-history-header" onClick={() => setShowSkippedHistory(v => !v)}>
          <h3>⏩ スキップ履歴 ({skippedCount})</h3>
          <span className="mypage-history-toggle">{showSkippedHistory ? '▲' : '▼'}</span>
        </div>
        {showSkippedHistory && (
          skippedUsers.length === 0
            ? <p className="mypage-empty-note">スキップした相手がいません</p>
            : <div className="mypage-history-list">
                {skippedUsers.map(user => (
                  <div key={user.id} className="mypage-history-item">
                    <img src={user.image} alt={user.name} className="mypage-history-avatar" onClick={() => onProfileClick(user)} />
                    <div className="mypage-history-info">
                      <span className="mypage-history-name">{user.name}</span>
                      <span className="mypage-history-sub">{user.age}歳 · {user.line}</span>
                    </div>
                    <button className="remove-button" onClick={() => onRemoveSkipped(user.id)}>削除</button>
                  </div>
                ))}
              </div>
        )}
      </div>

      {/* ── ツール・設定 ── */}
      <div className="mypage-settings">
        <h3>ツール</h3>
        <button className="settings-button fitcheck-open" onClick={onOpenFitCheck}>👗 Fit Check</button>
      </div>
      <div className="mypage-settings">
        <h3>設定</h3>
        <button className="settings-button danger" onClick={logout}>ログアウト</button>
      </div>
    </div>
  )
}
