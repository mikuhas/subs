import { useRailwayLines } from '../../composables/useRailwayLines'
import { useCommunity } from '../../contexts/CommunityContext'
import { mockCommunities } from '../../data/communities'

interface SearchSectionProps {
  profileAge?: number
  selectedLine: string
  onLineChange: (line: string) => void
  selectedCommunityId: number | ''
  onCommunityChange: (id: number | '') => void
  onSearch: () => void
}

export const SearchSection = ({
  profileAge,
  selectedLine,
  onLineChange,
  selectedCommunityId,
  onCommunityChange,
  onSearch,
}: SearchSectionProps) => {
  const { lines, loading } = useRailwayLines()
  const { joinedIds } = useCommunity()
  const joinedCommunities = mockCommunities.filter(c => joinedIds.includes(c.id))

  return (
    <div className="search-section">
      <h2>相手を探す</h2>

      <div className="search-age-display">
        <span className="search-age-label">検索年齢：</span>
        {profileAge ? (
          <span className="search-age-value">{profileAge}歳（±10歳）</span>
        ) : (
          <span className="search-age-unset">マイページで年齢を設定してください</span>
        )}
      </div>

      <div className="input-group">
        <label htmlFor="line-select">沿線：</label>
        <select
          id="line-select"
          value={selectedLine}
          onChange={e => onLineChange(e.target.value)}
          disabled={loading}
        >
          <option value="">{loading ? '読み込み中...' : 'すべての沿線'}</option>
          {lines.map(line => (
            <option key={line} value={line}>{line}</option>
          ))}
        </select>
      </div>

      {joinedCommunities.length > 0 && (
        <div className="input-group">
          <label htmlFor="community-select">コミュニティ：</label>
          <select
            id="community-select"
            value={selectedCommunityId}
            onChange={e => onCommunityChange(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">すべて</option>
            {joinedCommunities.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>
      )}

      <button className="search-button" onClick={onSearch} disabled={!profileAge}>
        相手を探す
      </button>
    </div>
  )
}
