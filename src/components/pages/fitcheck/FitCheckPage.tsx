import { useState, useRef } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { fetchFitCheck, fetchOutfitIllustration, fileToBase64, urlToBase64 } from '../../../utils/fitCheckService'
import { MarkdownView } from '../../ui/MarkdownView'

const STYLE_OPTIONS = [
  'カジュアル', 'きれいめ', 'ストリート', 'フォーマル',
  'スポーティ', 'ガーリー', 'モード', 'ナチュラル',
]

const COLOR_OPTIONS = [
  'ホワイト', 'ブラック', 'グレー', 'ネイビー', 'ベージュ',
  'ブラウン', 'カーキ', 'レッド', 'ピンク', 'ブルー', 'グリーン', 'イエロー',
]

const BUDGET_OPTIONS = ['5,000〜10,000円', '10,000〜20,000円', '20,000円〜']

const GENDER_OPTIONS: { label: string; value: 'mens' | 'womens' | 'kids' }[] = [
  { label: 'メンズ', value: 'mens' },
  { label: 'レディース', value: 'womens' },
  { label: 'キッズ', value: 'kids' },
]

type ImageEntry = { base64: string; preview: string }

export const FitCheckPage = () => {
  const { profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<ImageEntry[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | 'profile' | null>(null)
  const [style, setStyle] = useState(STYLE_OPTIONS[0])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [budget, setBudget] = useState('')
  const [gender, setGender] = useState<'mens' | 'womens' | 'kids' | ''>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imageBase64: string | null; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [profileBase64, setProfileBase64] = useState<string | null>(null)
  const [illustrationBase64, setIllustrationBase64] = useState<string | null>(null)
  const [illustrationLoading, setIllustrationLoading] = useState(false)
  const [illustrationError, setIllustrationError] = useState<string | null>(null)

  const activePreview =
    selectedIndex === 'profile' ? profile?.image ?? null
    : selectedIndex !== null ? images[selectedIndex]?.preview ?? null
    : null

  const activeBase64 =
    selectedIndex === 'profile' ? profileBase64
    : selectedIndex !== null ? images[selectedIndex]?.base64 ?? null
    : null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const entries = await Promise.all(
      files.map(async (file) => ({
        base64: await fileToBase64(file),
        preview: URL.createObjectURL(file),
      }))
    )
    setImages(prev => {
      const next = [...prev, ...entries]
      setSelectedIndex(next.length - 1)
      return next
    })
    setResult(null)
    e.target.value = ''
  }

  const handleSelectProfile = async () => {
    if (!profile?.image) return
    if (profileBase64) { setSelectedIndex('profile'); return }
    setLoading(true)
    setError(null)
    try {
      const b64 = await urlToBase64(profile.image)
      setProfileBase64(b64)
      setSelectedIndex('profile')
      setResult(null)
    } catch {
      setError('プロフィール画像の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index)
      if (selectedIndex === index) setSelectedIndex(next.length > 0 ? 0 : null)
      else if (typeof selectedIndex === 'number' && selectedIndex > index)
        setSelectedIndex(selectedIndex - 1)
      return next
    })
    setResult(null)
  }

  const handleGenerateIllustration = async () => {
    if (!result?.text) return
    setIllustrationLoading(true)
    setIllustrationError(null)
    setIllustrationBase64(null)
    try {
      const b64 = await fetchOutfitIllustration(result.text)
      if (!b64) throw new Error('イラスト生成に失敗しました（無料枠では利用できない場合があります）')
      setIllustrationBase64(b64)
    } catch (e) {
      setIllustrationError(e instanceof Error ? e.message : 'イラスト生成エラー')
    } finally {
      setIllustrationLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!activeBase64) return
    setLoading(true)
    setError(null)
    setResult(null)
    setIllustrationBase64(null)
    setIllustrationError(null)
    try {
      const res = await fetchFitCheck(activeBase64, style, {
        height: profile?.height,
        bodyType: profile?.bodyType,
        preferredColors: selectedColors.length ? selectedColors : undefined,
        budget: budget || undefined,
        gender: gender || undefined,
      })
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fitcheck-container">
      <h2>Fit Check</h2>
      <p className="fitcheck-desc">写真をアップロードして、AIが似合う服装を提案します</p>

      <div className="fitcheck-section">
        <div className="mypage-card-image">
          <div className="profile-image-area" style={{ cursor: 'default' }}>
            {activePreview
              ? <img src={activePreview} alt="選択中の写真" className="profile-image" />
              : <div className="fitcheck-card-placeholder">📷</div>
            }
          </div>
        </div>

        <div className="avatar-options" style={{ marginTop: 12 }}>
          {profile?.image && (
            <img
              src={profile.image}
              alt="プロフィール写真"
              className={`avatar-option ${selectedIndex === 'profile' ? 'selected' : ''}`}
              onClick={handleSelectProfile}
              title="プロフィール写真"
            />
          )}
          {images.map((img, i) => (
            <div key={i} className="fitcheck-thumb-wrap">
              <img
                src={img.preview}
                alt={`写真${i + 1}`}
                className={`avatar-option ${selectedIndex === i ? 'selected' : ''}`}
                onClick={() => { setSelectedIndex(i); setResult(null) }}
              />
              <button className="fitcheck-thumb-remove" onClick={() => handleRemove(i)}>×</button>
            </div>
          ))}
          <button
            className="fitcheck-upload-circle"
            onClick={() => fileInputRef.current?.click()}
            title="写真を追加"
          >
            ＋
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="fitcheck-section">
        <label className="fitcheck-label">性別</label>
        <div className="fitcheck-style-grid">
          {GENDER_OPTIONS.map(g => (
            <button
              key={g.value}
              className={`fitcheck-style-btn ${gender === g.value ? 'active' : ''}`}
              onClick={() => setGender(prev => prev === g.value ? '' : g.value)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fitcheck-section">
        <label className="fitcheck-label">スタイル</label>
        <div className="fitcheck-style-grid">
          {STYLE_OPTIONS.map(s => (
            <button key={s} className={`fitcheck-style-btn ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="fitcheck-section">
        <label className="fitcheck-label">好みの色（複数選択可）</label>
        <div className="fitcheck-style-grid">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c}
              className={`fitcheck-style-btn ${selectedColors.includes(c) ? 'active' : ''}`}
              onClick={() => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
            >{c}</button>
          ))}
        </div>
      </div>

      <div className="fitcheck-section">
        <label className="fitcheck-label">予算帯</label>
        <div className="fitcheck-style-grid">
          {BUDGET_OPTIONS.map(b => (
            <button key={b} className={`fitcheck-style-btn ${budget === b ? 'active' : ''}`} onClick={() => setBudget(prev => prev === b ? '' : b)}>{b}</button>
          ))}
        </div>
      </div>

      <button className="fitcheck-submit" onClick={handleSubmit} disabled={!activeBase64 || loading}>
        {loading ? '生成中...' : '似合う服を提案する'}
      </button>

      {error && <p className="fitcheck-error">{error}</p>}

      {result && (
        <div className="fitcheck-result">
          <h3>提案結果</h3>
          {result.imageBase64 && (
            <img src={`data:image/png;base64,${result.imageBase64}`} alt="コーデ提案" className="fitcheck-result-img" />
          )}
          {result.text && <MarkdownView text={result.text} />}

          <div className="fitcheck-illustration-section">
            <button
              className="fitcheck-submit fitcheck-illust-btn"
              onClick={handleGenerateIllustration}
              disabled={illustrationLoading}
            >
              {illustrationLoading ? '生成中...' : '🎨 コーデイラストを生成'}
            </button>
            {illustrationError && <p className="fitcheck-error">{illustrationError}</p>}
            {illustrationBase64 && (
              <img
                src={`data:image/png;base64,${illustrationBase64}`}
                alt="コーデイラスト"
                className="fitcheck-result-img"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
