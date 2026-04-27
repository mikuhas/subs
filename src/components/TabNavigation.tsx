type Tab = 'search' | 'liked' | 'messages' | 'skipped' | 'community' | 'mypage'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  likedCount: number
  skippedCount: number
  messageCount: number
}

const TABS: { id: Tab; label: string; icon: string; getCount?: (l: number, s: number, m: number) => number }[] = [
  { id: 'search',    label: '探す',         icon: '🔍' },
  { id: 'liked',     label: 'いいね',       icon: '❤️',  getCount: (l) => l },
  { id: 'messages',  label: 'メッセージ',   icon: '💬',  getCount: (_, __, m) => m },
  { id: 'skipped',   label: 'スキップ',     icon: '⏩',  getCount: (_, s) => s },
  { id: 'community', label: 'コミュニティ', icon: '👥' },
  { id: 'mypage',    label: 'マイページ',   icon: '👤' },
]

export const TabNavigation = ({
  activeTab,
  onTabChange,
  likedCount,
  skippedCount,
  messageCount,
}: TabNavigationProps) => {
  return (
    <nav className="tabs">
      {TABS.map(tab => {
        const count = tab.getCount ? tab.getCount(likedCount, skippedCount, messageCount) : 0
        return (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
          >
            <span className="tab-icon-wrap">
              {tab.icon}
              {count > 0 && <span className="tab-count">{count}</span>}
            </span>
            <span className="tab-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
