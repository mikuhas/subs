import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { fetchFitCheck, buildOutfitIllustrationUrl, fileToBase64, urlToBase64 } from '../../../utils/fitCheckService'
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

const PATTERN_COUNT = 3

type ImageEntry = { base64: string; preview: string }

export const FitCheckPage = () => {
  const { profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const illustrationTimerRefs = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    Array(PATTERN_COUNT).fill(null)
  )
  const illustrationRetryCounts = useRef<number[]>(Array(PATTERN_COUNT).fill(0))

  const [images, setImages] = useState<ImageEntry[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | 'profile' | null>(null)
  const [style, setStyle] = useState(STYLE_OPTIONS[0])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imageBase64: string | null; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [profileBase64, setProfileBase64] = useState<string | null>(null)

  const [illustrationUrls, setIllustrationUrls] = useState<(string | null)[]>(
    Array(PATTERN_COUNT).fill(null)
  )
  const [illustrationLoadings, setIllustrationLoadings] = useState<boolean[]>(
    Array(PATTERN_COUNT).fill(false)
  )
  const [illustrationErrors, setIllustrationErrors] = useState<(string | null)[]>(
    Array(PATTERN_COUNT).fill(null)
  )

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

  const clearIllustrationTimer = (i: number) => {
    if (illustrationTimerRefs.current[i]) {
      clearTimeout(illustrationTimerRefs.current[i]!)
      illustrationTimerRefs.current[i] = null
    }
  }

  useEffect(() => () => {
    for (let i = 0; i < PATTERN_COUNT; i++) clearIllustrationTimer(i)
  }, [])

  const resetIllustrationState = (i: number, errorMsg?: string) => {
    clearIllustrationTimer(i)
    setIllustrationLoadings(prev => { const n = [...prev]; n[i] = false; return n })
    setIllustrationUrls(prev => { const n = [...prev]; n[i] = null; return n })
    if (errorMsg) setIllustrationErrors(prev => { const n = [...prev]; n[i] = errorMsg; return n })
  }

  const isAnyIllustrationLoading = illustrationLoadings.some(Boolean)

  const handleGenerateIllustration = (i: number) => {
    if (!result?.text || isAnyIllustrationLoading) return
    clearIllustrationTimer(i)
    illustrationRetryCounts.current[i] = 0
    const url = buildOutfitIllustrationUrl(result.text, profile?.gender, i)
    setIllustrationLoadings(prev => { const n = [...prev]; n[i] = true; return n })
    setIllustrationErrors(prev => { const n = [...prev]; n[i] = null; return n })
    setIllustrationUrls(prev => { const n = [...prev]; n[i] = url; return n })
    illustrationTimerRefs.current[i] = setTimeout(
      () => resetIllustrationState(i, 'タイムアウトしました。もう一度お試しください。'),
      30000,
    )
  }

  const handleIllustrationError = (i: number) => {
    if (illustrationRetryCounts.current[i] < 1) {
      illustrationRetryCounts.current[i]++
      // 2秒待ってから別シードでリトライ（レート制限を避ける）
      setTimeout(() => {
        const url = buildOutfitIllustrationUrl(result?.text ?? '', profile?.gender, i)
        setIllustrationUrls(prev => { const n = [...prev]; n[i] = url; return n })
      }, 2000)
    } else {
      illustrationRetryCounts.current[i] = 0
      resetIllustrationState(i, 'イラスト生成に失敗しました。もう一度お試しください。')
    }
  }

  const handleSubmit = async () => {
    if (!activeBase64) return
    setLoading(true)
    setError(null)
    setResult(null)
    setIllustrationUrls(Array(PATTERN_COUNT).fill(null))
    setIllustrationLoadings(Array(PATTERN_COUNT).fill(false))
    setIllustrationErrors(Array(PATTERN_COUNT).fill(null))
    try {
      const res = await fetchFitCheck(activeBase64, style, {
        height: profile?.height,
        bodyType: profile?.bodyType,
        preferredColors: selectedColors.length ? selectedColors : undefined,
        budget: budget || undefined,
        gender: profile?.gender || undefined,
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
      <h2>デートコーデ相談</h2>
      <p className="fitcheck-desc">写真を選んで条件を入れるだけで、AIがデートにぴったりなコーデを提案してくれるよ！</p>

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
        <label className="fitcheck-label">どんな雰囲気がいい？</label>
        <div className="fitcheck-style-grid">
          {STYLE_OPTIONS.map(s => (
            <button key={s} className={`fitcheck-style-btn ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="fitcheck-section">
        <label className="fitcheck-label">好きな色は？（複数OK）</label>
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
        <label className="fitcheck-label">予算感は？</label>
        <div className="fitcheck-style-grid">
          {BUDGET_OPTIONS.map(b => (
            <button key={b} className={`fitcheck-style-btn ${budget === b ? 'active' : ''}`} onClick={() => setBudget(prev => prev === b ? '' : b)}>{b}</button>
          ))}
        </div>
      </div>

      <button className="fitcheck-submit" onClick={handleSubmit} disabled={!activeBase64 || loading}>
        {loading ? 'AIがコーデを考え中...✨' : 'デートコーデを提案してもらう'}
      </button>

      {error && <p className="fitcheck-error">{error}</p>}

      {result && (
        <div className="fitcheck-result">
          <h3>AIからのコーデ提案</h3>
          {result.imageBase64 && (
            <img src={`data:image/png;base64,${result.imageBase64}`} alt="コーデ提案" className="fitcheck-result-img" />
          )}
          {result.text
            .split(/(?=\n##[^\n]*パターン\d)/)
            .filter(s => /##[^\n]*パターン\d/.test(s))
            .map((patternText, i) => (
              <div key={i} className="fitcheck-pattern-row">
                <div className="fitcheck-pattern-text">
                  <MarkdownView text={patternText} />
                </div>
                <div className="fitcheck-illust-pattern">
                  <p className="fitcheck-illust-pattern-label">コーデ {i + 1} のビジュアル</p>
                  {illustrationLoadings[i] ? (
                    <div className="fitcheck-illust-loading">
                      <div className="fitcheck-illust-emojis">
                        <span><i className="ri-t-shirt-line"></i></span><span><i className="ri-sparkling-line"></i></span><span><i className="ri-shirt-line"></i></span><span><i className="ri-sparkling-line"></i></span><span><i className="ri-footprint-line"></i></span>
                      </div>
                      <p className="fitcheck-illust-loading-text">イラストを描いてるよ...🎨</p>
                    </div>
                  ) : (
                    <button
                      className="fitcheck-submit fitcheck-illust-btn"
                      onClick={() => handleGenerateIllustration(i)}
                      disabled={isAnyIllustrationLoading}
                    >
                      <i className="ri-palette-line"></i> イラストを見てみる
                    </button>
                  )}
                  {illustrationErrors[i] && (
                    <p className="fitcheck-error">{illustrationErrors[i]}</p>
                  )}
                  {illustrationUrls[i] && (
                    <img
                      src={illustrationUrls[i]!}
                      alt={`コーデイラスト パターン${i + 1}`}
                      className="fitcheck-result-illust-img"
                      referrerPolicy="no-referrer"
                      onLoad={() => {
                        clearIllustrationTimer(i)
                        setIllustrationLoadings(prev => { const n = [...prev]; n[i] = false; return n })
                      }}
                      onError={() => handleIllustrationError(i)}
                    />
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
