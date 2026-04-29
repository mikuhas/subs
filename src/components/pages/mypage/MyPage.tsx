import { useState, useRef } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useCommunity } from '../../../contexts/CommunityContext'
import { Profile } from '../../../types/profile'
import { User } from '../../../types/user'
import { useRailwayLines } from '../../../composables/useRailwayLines'
import { mockCommunities } from '../../../data/communities'

const BODY_TYPES = ['スリム', '普通', 'がっちり', 'ぽっちゃり', '筋肉質']

const MAJOR_STATIONS = [
  '渋谷', '新宿', '池袋', '原宿', '恵比寿', '代官山', '中目黒', '表参道',
  '吉祥寺', '秋葉原', '上野', '浅草', '銀座', '六本木', '麻布十番', '品川',
  '五反田', '目黒', '大崎', '新橋', '有楽町', '赤坂', '大手町', '東京',
  '日本橋', '押上', '錦糸町', '北千住', '川口', '大宮', '浦和', '川越',
  '所沢', '船橋', '千葉', '横浜', '川崎', '立川', '八王子', '町田',
  '二子玉川', '下北沢', '高円寺', '中野', '三軒茶屋', '自由が丘', '武蔵小杉',
]

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
  const [editingField, setEditingField] = useState<keyof Profile | null>(null)
  const [fieldDraft, setFieldDraft] = useState<Profile[keyof Profile] | undefined>(undefined)
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

  const openField = <K extends keyof Profile>(key: K, val: Profile[K]) => {
    setEditingField(key)
    setFieldDraft(val)
  }
  const commitField = () => {
    if (editingField !== null) set(editingField, fieldDraft as Profile[typeof editingField])
    setEditingField(null)
  }
  const discardField = () => setEditingField(null)

  const FIELD_LABELS: Partial<Record<keyof Profile, string>> = {
    name: '名前', age: '年齢', bio: '自己紹介',
    preferredLine: '好きな沿線', preferredMeetingArea: '出会いたいエリア',
    height: '身長', bodyType: '体型',
    frequentStation: 'よく遊ぶ駅', firstDateStation: '最初のデート希望場所',
  }

  const renderFieldInput = () => {
    switch (editingField) {
      case 'name':
        return (
          <input
            className="mpe-name-input field-modal-input"
            type="text"
            value={fieldDraft as string ?? ''}
            onChange={e => setFieldDraft(e.target.value)}
            autoFocus
          />
        )
      case 'age':
        return (
          <div className="mpe-inline">
            <input
              className="mpe-field-select mpe-height-input"
              type="number" min="18" max="99"
              value={fieldDraft as number ?? ''}
              onChange={e => setFieldDraft(Number(e.target.value))}
              autoFocus
            />
            <span className="mpe-unit">歳</span>
          </div>
        )
      case 'bio':
        return (
          <>
            <div className="field-modal-bio-counter">
              <span className={`mpe-bio-count ${((fieldDraft as string) ?? '').length >= 450 ? 'near-limit' : ''}`}>
                {((fieldDraft as string) ?? '').length} / 500
              </span>
            </div>
            <textarea
              className="mpe-textarea mpe-bio-textarea"
              placeholder="趣味や好きなことを書いてみよう..."
              value={fieldDraft as string ?? ''}
              maxLength={500}
              onChange={e => setFieldDraft(e.target.value)}
              autoFocus
            />
          </>
        )
      case 'preferredLine':
        return (
          <select className="mpe-field-select" value={fieldDraft as string ?? ''}
            onChange={e => setFieldDraft(e.target.value)} disabled={linesLoading}>
            <option value="">{linesLoading ? '読み込み中...' : '選択してください'}</option>
            {lines.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        )
      case 'preferredMeetingArea':
        return (
          <select className="mpe-field-select" value={fieldDraft as string ?? ''}
            onChange={e => setFieldDraft(e.target.value)}>
            <option value="">選択してください</option>
            {TOKYO_MEETING_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )
      case 'height':
        return (
          <div className="mpe-inline">
            <input
              className="mpe-field-select mpe-height-input"
              type="number" min="140" max="210" placeholder="例: 170"
              value={fieldDraft as number ?? ''}
              onChange={e => setFieldDraft(e.target.value ? Number(e.target.value) : undefined)}
              autoFocus
            />
            <span className="mpe-unit">cm</span>
          </div>
        )
      case 'bodyType':
        return (
          <select className="mpe-field-select" value={fieldDraft as string ?? ''}
            onChange={e => setFieldDraft(e.target.value || undefined)}>
            <option value="">選択してください</option>
            {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )
      case 'frequentStation':
        return (
          <select className="mpe-field-select" value={fieldDraft as string ?? ''}
            onChange={e => setFieldDraft(e.target.value || undefined)}>
            <option value="">選択してください</option>
            {MAJOR_STATIONS.map(s => <option key={s} value={s}>{s}駅</option>)}
          </select>
        )
      case 'firstDateStation':
        return (
          <select className="mpe-field-select" value={fieldDraft as string ?? ''}
            onChange={e => setFieldDraft(e.target.value || undefined)}>
            <option value="">選択してください</option>
            {MAJOR_STATIONS.map(s => <option key={s} value={s}>{s}周辺</option>)}
          </select>
        )
      default:
        return null
    }
  }

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
            {/* アバター + フォト選択 */}
            <div className="mpe-avatar-section">
              <div className="mpe-avatar-wrapper">
                <img src={editForm?.image} alt="プロフィール" className="mpe-avatar-img" />
                <span className="mpe-avatar-camera">📷</span>
              </div>
              <div className="mpe-photo-strip">
                {[...AVATAR_OPTIONS, ...uploadedImages].map(url => (
                  <button key={url} className={`pd-thumb ${editForm?.image === url ? 'active' : ''}`}
                    onClick={() => set('image', url)}>
                    <img src={url} alt="" />
                  </button>
                ))}
                <button className="pd-thumb mpe-upload-btn" onClick={() => fileInputRef.current?.click()}>
                  <span>＋</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
              </div>
            </div>

            {/* フィールドグリッド */}
            <div className="mpe-edit-grid">

              {/* 名前 – フル幅 */}
              <div className="mpe-tile mpe-tile-full" onClick={() => openField('name', editForm?.name)}>
                <div className="mpe-tile-inner">
                  <span className="mpe-tile-icon">👤</span>
                  <div className="mpe-tile-texts">
                    <span className="mpe-tile-label">名前</span>
                    <span className="mpe-tile-value">{editForm?.name || '未設定'}</span>
                  </div>
                </div>
                <i className="ri-arrow-right-s-line mpe-tile-chevron" />
              </div>

              {/* 年齢 */}
              <div className="mpe-tile" onClick={() => openField('age', editForm?.age)}>
                <span className="mpe-tile-icon">🎂</span>
                <span className="mpe-tile-label">年齢</span>
                <span className="mpe-tile-value">{editForm?.age ? `${editForm.age}歳` : '—'}</span>
              </div>

              {/* 身長 */}
              <div className="mpe-tile" onClick={() => openField('height', editForm?.height)}>
                <span className="mpe-tile-icon">📏</span>
                <span className="mpe-tile-label">身長</span>
                <span className="mpe-tile-value">{editForm?.height ? `${editForm.height}cm` : '—'}</span>
              </div>

              {/* 体型 */}
              <div className="mpe-tile" onClick={() => openField('bodyType', editForm?.bodyType)}>
                <span className="mpe-tile-icon">👕</span>
                <span className="mpe-tile-label">体型</span>
                <span className="mpe-tile-value">{editForm?.bodyType || '—'}</span>
              </div>

              {/* 好きな沿線 */}
              <div className="mpe-tile" onClick={() => openField('preferredLine', editForm?.preferredLine)}>
                <span className="mpe-tile-icon">🚃</span>
                <span className="mpe-tile-label">好きな沿線</span>
                <span className="mpe-tile-value">{editForm?.preferredLine || '—'}</span>
              </div>

              {/* 出会いたいエリア */}
              <div className="mpe-tile" onClick={() => openField('preferredMeetingArea', editForm?.preferredMeetingArea)}>
                <span className="mpe-tile-icon">📍</span>
                <span className="mpe-tile-label">出会いたいエリア</span>
                <span className="mpe-tile-value">{editForm?.preferredMeetingArea || '—'}</span>
              </div>

              {/* よく遊ぶ駅 */}
              <div className="mpe-tile" onClick={() => openField('frequentStation', editForm?.frequentStation)}>
                <span className="mpe-tile-icon">🗺️</span>
                <span className="mpe-tile-label">よく遊ぶ駅</span>
                <span className="mpe-tile-value">{editForm?.frequentStation ? `${editForm.frequentStation}駅` : '—'}</span>
              </div>

              {/* 最初のデート */}
              <div className="mpe-tile" onClick={() => openField('firstDateStation', editForm?.firstDateStation)}>
                <span className="mpe-tile-icon">💑</span>
                <span className="mpe-tile-label">最初のデート</span>
                <span className="mpe-tile-value">{editForm?.firstDateStation ? `${editForm.firstDateStation}周辺` : '—'}</span>
              </div>

              {/* 自己紹介 – フル幅 */}
              <div className="mpe-tile mpe-tile-full mpe-tile-bio" onClick={() => openField('bio', editForm?.bio)}>
                <div className="mpe-tile-inner">
                  <span className="mpe-tile-icon">✏️</span>
                  <div className="mpe-tile-texts">
                    <span className="mpe-tile-label">自己紹介</span>
                    <span className="mpe-tile-bio-preview">{editForm?.bio || '未入力'}</span>
                  </div>
                </div>
                <i className="ri-arrow-right-s-line mpe-tile-chevron" />
              </div>

              {/* ランダムマッチ – フル幅 */}
              <div className="mpe-tile mpe-tile-full mpe-tile-toggle">
                <div className="mpe-tile-inner">
                  <span className="mpe-tile-icon">💞</span>
                  <div className="mpe-tile-texts">
                    <span className="mpe-tile-label">ランダムマッチ</span>
                    <span className="mpe-tile-value">
                      {editForm?.randomMatchEnabled !== false ? '対象に含める' : '対象から外す'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`mpe-ios-toggle ${editForm?.randomMatchEnabled !== false ? 'on' : ''}`}
                  onClick={() => set('randomMatchEnabled', !(editForm?.randomMatchEnabled !== false))}
                />
              </div>

            </div>

            {/* 保存・キャンセル */}
            <div className="mpe-actions">
              <button className="mpe-save-btn" onClick={handleSave}>保存</button>
              <button className="mpe-cancel-btn" onClick={handleCancel}>キャンセル</button>
            </div>

            {/* フィールド編集モーダル */}
            {editingField && (
              <div className="field-modal-overlay">
                <div className="field-modal" onClick={e => e.stopPropagation()}>
                  <div className="field-modal-header">
                    <span className="field-modal-icon">{
                      ({ name:'👤', age:'🎂', bio:'✏️', preferredLine:'🚃',
                        preferredMeetingArea:'📍', height:'📏', bodyType:'👕',
                        frequentStation:'🗺️', firstDateStation:'💑' } as Record<string, string>)[editingField]
                    }</span>
                    <h4 className="field-modal-title">{FIELD_LABELS[editingField]}</h4>
                  </div>
                  <div className="field-modal-body">
                    {renderFieldInput()}
                  </div>
                  <div className="field-modal-actions">
                    <button className="field-modal-cancel" onClick={discardField}>キャンセル</button>
                    <button className="field-modal-save" onClick={commitField}>保存</button>
                  </div>
                </div>
              </div>
            )}
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
                  { icon: 'ri-person-fill', label: '性別',          value: profile?.gender ? GENDER_LABEL[profile.gender] : undefined },
                  { icon: 'ri-railway-fill', label: '好きな沿線',     value: profile?.preferredLine },
                  { icon: 'ri-map-pin-fill', label: '出会いたいエリア', value: profile?.preferredMeetingArea },
                  { icon: 'ri-ruler-fill', label: '身長',           value: profile?.height ? `${profile.height}cm` : undefined },
                  { icon: 'ri-user-fill', label: '体型',           value: profile?.bodyType },
                  { icon: 'ri-dice-fill', label: 'ランダムマッチ',  value: profile?.randomMatchEnabled !== false ? '対象に含める' : '対象から外す' },
                  { icon: 'ri-map-2-fill', label: 'よく遊ぶ駅',     value: profile?.frequentStation ? `${profile.frequentStation}駅` : undefined },
                  { icon: 'ri-heart-2-fill', label: '最初のデート希望場所', value: profile?.firstDateStation ? `${profile.firstDateStation}周辺` : undefined },
                  { icon: 'ri-mail-fill', label: 'メール',         value: profile?.email },
                ].filter(({ value }) => !!value).map(({ icon, label, value }) => (
                  <div key={label} className="pd-info-item">
                    <span className="pd-info-icon"><i className={icon}></i></span>
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
