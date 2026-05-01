import { useRailwayLines } from '../../../hooks/useRailwayLines'
import { useCommunity } from '../../../contexts/CommunityContext'
import { mockCommunities } from '../../../data/communities'

const BODY_TYPES = ['スリム', '普通', 'がっちり', 'ぽっちゃり', '筋肉質']

const FIRST_DATE_SITUATIONS = [
  'お昼にカフェで', '夜にバーで', '夜に居酒屋で',
  'ランチにレストランで', 'ディナーにレストランで',
  '映画を観てから食事', '昼に公園散歩', '夕方に美術館・展示で',
  '水族館・動物園', '夜景スポット', 'ショッピング',
  'アウトドア・BBQ', 'ドライブ', '週末にランチ',
]

interface SearchModalProps {
  selectedLine: string
  selectedCommunityId: number | ''
  ageMin: number | ''
  ageMax: number | ''
  selectedBodyType: string
  selectedFirstDateSituation: string
  onLineChange: (v: string) => void
  onCommunityChange: (v: number | '') => void
  onAgeMinChange: (v: number | '') => void
  onAgeMaxChange: (v: number | '') => void
  onBodyTypeChange: (v: string) => void
  onFirstDateSituationChange: (v: string) => void
  onReset: () => void
  onApply: () => void
  onClose: () => void
}

export const SearchModal = ({
  selectedLine,
  selectedCommunityId,
  ageMin,
  ageMax,
  selectedBodyType,
  selectedFirstDateSituation,
  onLineChange,
  onCommunityChange,
  onAgeMinChange,
  onAgeMaxChange,
  onBodyTypeChange,
  onFirstDateSituationChange,
  onReset,
  onApply,
  onClose,
}: SearchModalProps) => {
  const { lines, loading: linesLoading } = useRailwayLines()
  const { joinedIds } = useCommunity()
  const joinedCommunities = mockCommunities.filter(c => joinedIds.includes(c.id))

  const toggleBodyType = (val: string) =>
    onBodyTypeChange(selectedBodyType === val ? '' : val)

  const toggleFirstDate = (val: string) =>
    onFirstDateSituationChange(selectedFirstDateSituation === val ? '' : val)

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>

        <div className="search-modal-header">
          <h3 className="search-modal-title">絞り込み条件</h3>
          <button className="search-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="search-modal-scroll">

          {/* 年齢 */}
          <div className="search-modal-section">
            <p className="search-modal-section-title">年齢</p>
            <div className="search-modal-age-row">
              <input
                className="search-modal-age-input"
                type="number"
                min={18}
                max={99}
                placeholder="下限"
                value={ageMin}
                onChange={e => onAgeMinChange(e.target.value ? Number(e.target.value) : '')}
              />
              <span className="search-modal-age-sep">〜</span>
              <input
                className="search-modal-age-input"
                type="number"
                min={18}
                max={99}
                placeholder="上限"
                value={ageMax}
                onChange={e => onAgeMaxChange(e.target.value ? Number(e.target.value) : '')}
              />
              <span className="search-modal-age-unit">歳</span>
            </div>
          </div>

          {/* 沿線 */}
          <div className="search-modal-section">
            <p className="search-modal-section-title">沿線</p>
            <select
              className="search-modal-select"
              value={selectedLine}
              onChange={e => onLineChange(e.target.value)}
              disabled={linesLoading}
            >
              <option value="">{linesLoading ? '読み込み中...' : 'すべての沿線'}</option>
              {lines.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* コミュニティ */}
          {joinedCommunities.length > 0 && (
            <div className="search-modal-section">
              <p className="search-modal-section-title">コミュニティ</p>
              <select
                className="search-modal-select"
                value={selectedCommunityId}
                onChange={e => onCommunityChange(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">すべて</option>
                {joinedCommunities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 体型 */}
          <div className="search-modal-section">
            <p className="search-modal-section-title">体型</p>
            <div className="search-modal-chips">
              {BODY_TYPES.map(t => (
                <button
                  key={t}
                  className={`search-modal-chip ${selectedBodyType === t ? 'active' : ''}`}
                  onClick={() => toggleBodyType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 最初のデート */}
          <div className="search-modal-section">
            <p className="search-modal-section-title">最初のデート</p>
            <div className="search-modal-chips">
              {FIRST_DATE_SITUATIONS.map(s => (
                <button
                  key={s}
                  className={`search-modal-chip ${selectedFirstDateSituation === s ? 'active' : ''}`}
                  onClick={() => toggleFirstDate(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="search-modal-actions">
          <button className="search-modal-reset" onClick={onReset}>リセット</button>
          <button className="search-modal-apply" onClick={onApply}>この条件で探す</button>
        </div>

      </div>
    </div>
  )
}
