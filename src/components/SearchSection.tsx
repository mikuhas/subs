interface SearchSectionProps {
  myAge: number | ''
  onAgeChange: (age: number | '') => void
  onSearch: () => void
}

export const SearchSection = ({
  myAge,
  onAgeChange,
  onSearch,
}: SearchSectionProps) => {
  return (
    <div className="search-section">
      <h2>相手を探す</h2>

      <div className="input-group">
        <label htmlFor="age-input">あなたの年齢：</label>
        <input
          id="age-input"
          type="number"
          min="18"
          max="100"
          value={myAge}
          onChange={(e) => onAgeChange(e.target.value ? Number(e.target.value) : '')}
          placeholder="年齢を入力"
        />
        <span className="age-range">(±3歳の範囲で検索)</span>
      </div>

      <button className="search-button" onClick={onSearch}>
        相手を探す
      </button>
    </div>
  )
}
