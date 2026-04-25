interface TabNavigationProps {
  activeTab: 'search' | 'liked' | 'skipped' | 'mypage'
  onTabChange: (tab: 'search' | 'liked' | 'skipped' | 'mypage') => void
  likedCount: number
  skippedCount: number
}

export const TabNavigation = ({
  activeTab,
  onTabChange,
  likedCount,
  skippedCount,
}: TabNavigationProps) => {
  return (
    <div className="tabs">
      <button
        className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => onTabChange('search')}
      >
        相手を探す
      </button>
      <button
        className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
        onClick={() => onTabChange('liked')}
      >
        いいね ({likedCount})
      </button>
      <button
        className={`tab-button ${activeTab === 'skipped' ? 'active' : ''}`}
        onClick={() => onTabChange('skipped')}
      >
        スキップ ({skippedCount})
      </button>
      <button
        className={`tab-button ${activeTab === 'mypage' ? 'active' : ''}`}
        onClick={() => onTabChange('mypage')}
      >
        マイページ
      </button>
    </div>
  )
}
