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
    if (profile) {
      setEditForm({ ...profile })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    if (editForm) {
      updateProfile(editForm)
      setIsEditing(false)
      setEditForm(null)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm(null)
  }

  const likedCount = likedUsers.length
  const skippedCount = skippedUsers.length
  const matchRate = likedCount + skippedCount > 0
    ? Math.round((likedCount / (likedCount + skippedCount)) * 100)
    : 0

  return (
    <div className="mypage-container">
      <h2>マイページ</h2>

      <div className="mypage-profile">
        {isEditing ? (
          /* ── 編集モード ── */
          <>
            <div className="mypage-card-image">
              <div className="profile-image-area">
                <img src={editForm?.image} alt="マイプロフィール" className="profile-image" />
              </div>
              <div className="avatar-options">
                {[...AVATAR_OPTIONS, ...uploadedImages].map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="アバター"
                    className={`avatar-option ${editForm?.image === url ? 'selected' : ''}`}
                    onClick={() => setEditForm(f => f ? { ...f, image: url } : f)}
                  />
                ))}
                <button
                  className="fitcheck-upload-circle"
                  onClick={() => fileInputRef.current?.click()}
                  title="写真をアップロード"
                >＋</button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="mypage-info">
              <h3 className="mypage-edit-title">プロフィールを編集</h3>

              <div className="mypage-field">
                <label>名前</label>
                <input type="text" value={editForm?.name ?? ''} onChange={(e) => setEditForm(f => f ? { ...f, name: e.target.value } : f)} />
              </div>
              <div className="mypage-field">
                <label>年齢</label>
                <input type="number" min="18" max="99" value={editForm?.age ?? ''} onChange={(e) => setEditForm(f => f ? { ...f, age: Number(e.target.value) } : f)} />
              </div>
              <div className="mypage-field">
                <label>自己紹介</label>
                <textarea value={editForm?.bio ?? ''} onChange={(e) => setEditForm(f => f ? { ...f, bio: e.target.value } : f)} />
              </div>
              <div className="mypage-field">
                <label>
                  好きな沿線
                  {linesError && <span className="field-note">（オフライン時はデフォルト路線を表示）</span>}
                </label>
                <select value={editForm?.preferredLine ?? ''} onChange={(e) => setEditForm(f => f ? { ...f, preferredLine: e.target.value } : f)} disabled={linesLoading}>
                  <option value="">{linesLoading ? '読み込み中...' : '選択してください'}</option>
                  {lines.map((line) => <option key={line} value={line}>{line}</option>)}
                </select>
              </div>
              <div className="mypage-field">
                <label>希望の出会う場所（東京）</label>
                <select value={editForm?.preferredMeetingArea ?? ''} onChange={(e) => setEditForm(f => f ? { ...f, preferredMeetingArea: e.target.value } : f)}>
                  <option value="">選択してください</option>
                  {TOKYO_MEETING_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
              <div className="mypage-field">
                <label>身長 (cm)</label>
                <input type="number" min="140" max="210" placeholder="例: 170" value={editForm?.height ?? ''} onChange={(e) => setEditForm(f => f ? { ...f, height: e.target.value ? Number(e.target.value) : undefined } : f)} />
              </div>
              <div className="mypage-field">
                <label>体型</label>
                <select value={editForm?.bodyType ?? ''} onChange={(e) => setEditForm(f => f ? { ...f, bodyType: e.target.value || undefined } : f)}>
                  <option value="">選択してください</option>
                  {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="mypage-field">
                <label>ランダムマッチ</label>
                <button
                  type="button"
                  className={`random-match-toggle ${editForm?.randomMatchEnabled !== false ? 'on' : 'off'}`}
                  onClick={() => setEditForm(f => f ? { ...f, randomMatchEnabled: !(f.randomMatchEnabled !== false) } : f)}
                >
                  {editForm?.randomMatchEnabled !== false ? '✅ 対象に含める' : '🚫 対象から外す'}
                </button>
              </div>

              <div className="edit-actions">
                <button className="save-button" onClick={handleSave}>保存</button>
                <button className="cancel-button" onClick={handleCancel}>キャンセル</button>
              </div>
            </div>
          </>
        ) : (
          /* ── 閲覧モード ── */
          <div className="mypage-view">
            <div className="mypage-view-top">
              <img src={profile?.image} alt="マイプロフィール" className="mypage-view-avatar" />
              <div className="mypage-view-head">
                <p className="mypage-view-name">{profile?.name || '未設定'}</p>
                <p className="mypage-view-age">{profile?.age ? `${profile.age}歳` : '年齢未設定'}</p>
                <button className="edit-button" onClick={handleEditStart}>編集</button>
              </div>
            </div>

            {profile?.bio && (
              <p className="mypage-view-bio">{profile.bio}</p>
            )}

            <div className="mypage-view-rows">
              {[
                { label: '沿線',      value: profile?.preferredLine },
                { label: '出会いたいエリア', value: profile?.preferredMeetingArea },
                { label: '身長',      value: profile?.height ? `${profile.height}cm` : undefined },
                { label: '体型',      value: profile?.bodyType },
                { label: 'ランダムマッチ', value: profile?.randomMatchEnabled !== false ? '対象に含める' : '対象から外す' },
                { label: 'メール',    value: profile?.email },
              ].map(({ label, value }) => (
                <div key={label} className="mypage-view-row">
                  <span className="mypage-view-label">{label}</span>
                  <span className="mypage-view-value">{value || '未設定'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
                <button
                  className="mypage-community-leave"
                  onClick={() => leave(c.id)}
                >
                  脱退
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mypage-history">
        <div
          className="mypage-history-header"
          onClick={() => setShowLikedHistory(v => !v)}
        >
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

      <div className="mypage-history">
        <div
          className="mypage-history-header"
          onClick={() => setShowSkippedHistory(v => !v)}
        >
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
