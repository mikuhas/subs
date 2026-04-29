type Tab = 'search' | 'activity' | 'messages' | 'community' | 'mypage'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  receivedLikesCount: number
  messageCount: number
}

const TABS: { id: Tab; label: string; iconClass: string; getCount?: (received: number, msg: number) => number }[] = [
  { id: 'search',    label: '探す',         iconClass: 'ri-search-line' },
  { id: 'activity',  label: 'マッチング',   iconClass: 'ri-heart-line',  getCount: (received) => received },
  { id: 'messages',  label: 'メッセージ',   iconClass: 'ri-message-3-line',  getCount: (_, msg) => msg },
  { id: 'community', label: 'コミュニティ', iconClass: 'ri-group-line' },
  { id: 'mypage',    label: 'マイページ',   iconClass: 'ri-user-line' },
]

export const TabNavigation = ({
  activeTab,
  onTabChange,
  receivedLikesCount,
  messageCount,
}: TabNavigationProps) => {
  return (
    <nav className="tabs">
      {TABS.map(tab => {
        const count = tab.getCount ? tab.getCount(receivedLikesCount, messageCount) : 0
        return (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
          >
            <span className="tab-icon-wrap">
              <i className={tab.iconClass}></i>
              {count > 0 && <span className="tab-count">{count}</span>}
            </span>
            <span className="tab-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
