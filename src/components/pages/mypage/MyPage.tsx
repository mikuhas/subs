import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useCommunity } from '../../../contexts/CommunityContext'
import { Profile } from '../../../types/profile'
import { useRailwayLines } from '../../../hooks/useRailwayLines'
import { mockCommunities } from '../../../mocks/communities'

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
  likedCount: number
  skippedCount: number
}

export const MyPage = ({ likedCount, skippedCount }: MyPageProps) => {
  const { profile, logout, updateProfile } = useAuth()
  const { joinedIds, leave } = useCommunity()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Profile | null>(null)
  const { lines, loading: linesLoading, error: linesError } = useRailwayLines()
  const joinedCommunities = mockCommunities.filter(c => joinedIds.includes(c.id))

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

  const matchRate = likedCount + skippedCount > 0
    ? Math.round((likedCount / (likedCount + skippedCount)) * 100)
    : 0

  return (
    <div className="mypage-container">
      <h2>マイページ</h2>

      <div className="mypage-profile">
        <div className="mypage-avatar">
          <img
            src={isEditing ? editForm?.image : profile?.image}
            alt="マイプロフィール"
          />
          {isEditing && (
            <div className="avatar-options">
              {AVATAR_OPTIONS.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="アバター"
                  className={`avatar-option ${editForm?.image === url ? 'selected' : ''}`}
                  onClick={() => setEditForm(f => f ? { ...f, image: url } : f)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mypage-info">
          <div className="mypage-info-header">
            <h3>{isEditing ? 'プロフィールを編集' : 'あなたのプロフィール'}</h3>
            {!isEditing && (
              <button className="edit-button" onClick={handleEditStart}>編集</button>
            )}
          </div>

          <div className="mypage-field">
            <label>名前</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm?.name ?? ''}
                onChange={(e) => setEditForm(f => f ? { ...f, name: e.target.value } : f)}
              />
            ) : (
              <p className="mypage-value">{profile?.name || '未設定'}</p>
            )}
          </div>

          <div className="mypage-field">
            <label>年齢</label>
            {isEditing ? (
              <input
                type="number"
                min="18"
                max="99"
                value={editForm?.age ?? ''}
                onChange={(e) => setEditForm(f => f ? { ...f, age: Number(e.target.value) } : f)}
              />
            ) : (
              <p className="mypage-value">{profile?.age ? `${profile.age}歳` : '未設定'}</p>
            )}
          </div>

          <div className="mypage-field">
            <label>自己紹介</label>
            {isEditing ? (
              <textarea
                value={editForm?.bio ?? ''}
                onChange={(e) => setEditForm(f => f ? { ...f, bio: e.target.value } : f)}
              />
            ) : (
              <p className="mypage-value">{profile?.bio || '未設定'}</p>
            )}
          </div>

          <div className="mypage-field">
            <label>
              好きな沿線
              {linesError && <span className="field-note">（オフライン時はデフォルト路線を表示）</span>}
            </label>
            {isEditing ? (
              <select
                value={editForm?.preferredLine ?? ''}
                onChange={(e) => setEditForm(f => f ? { ...f, preferredLine: e.target.value } : f)}
                disabled={linesLoading}
              >
                <option value="">{linesLoading ? '読み込み中...' : '選択してください'}</option>
                {lines.map((line) => (
                  <option key={line} value={line}>{line}</option>
                ))}
              </select>
            ) : (
              <p className="mypage-value">{profile?.preferredLine || '未設定'}</p>
            )}
          </div>

          <div className="mypage-field">
            <label>希望の出会う場所（東京）</label>
            {isEditing ? (
              <select
                value={editForm?.preferredMeetingArea ?? ''}
                onChange={(e) => setEditForm(f => f ? { ...f, preferredMeetingArea: e.target.value } : f)}
              >
                <option value="">選択してください</option>
                {TOKYO_MEETING_AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            ) : (
              <p className="mypage-value">{profile?.preferredMeetingArea || '未設定'}</p>
            )}
          </div>

          <div className="mypage-field">
            <label>メールアドレス</label>
            <p className="mypage-value">{profile?.email}</p>
          </div>

          {isEditing && (
            <div className="edit-actions">
              <button className="save-button" onClick={handleSave}>保存</button>
              <button className="cancel-button" onClick={handleCancel}>キャンセル</button>
            </div>
          )}
        </div>
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

      <div className="mypage-settings">
        <h3>設定</h3>
        <button className="settings-button danger" onClick={logout}>ログアウト</button>
      </div>
    </div>
  )
}
