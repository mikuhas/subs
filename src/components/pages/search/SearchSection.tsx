interface SearchSectionProps {
  activeFilterCount: number
  activeFilterChips: string[]
  onOpenModal: () => void
  onSearch: () => void
}

export const SearchSection = ({
  activeFilterCount,
  activeFilterChips,
  onOpenModal,
  onSearch,
}: SearchSectionProps) => (
  <div className="search-section">
    <div className="search-header">
      <h2>条件で探す</h2>
      <button className="search-filter-btn" onClick={onOpenModal}>
        <i className="ri-filter-3-line" />
        絞り込み
        {activeFilterCount > 0 && (
          <span className="search-filter-badge">{activeFilterCount}</span>
        )}
      </button>
    </div>

    {activeFilterChips.length > 0 && (
      <div className="search-active-chips">
        {activeFilterChips.map(chip => (
          <span key={chip} className="search-active-chip">{chip}</span>
        ))}
      </div>
    )}

    <button className="search-button" onClick={onSearch}>
      相手を探す
    </button>
  </div>
)
