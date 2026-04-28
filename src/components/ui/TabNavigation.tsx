type Tab = 'search' | 'activity' | 'messages' | 'community' | 'mypage'

interface TabNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  receivedLikesCount: number
  messageCount: number
}

const TABS: { id: Tab; label: string; icon: string; getCount?: (received: number, msg: number) => number }[] = [
  { id: 'search',    label: '探す',         icon: '🔍' },
  { id: 'activity',  label: 'マッチング',   icon: '💞',  getCount: (received) => received },
  { id: 'messages',  label: 'メッセージ',   icon: '💬',  getCount: (_, msg) => msg },
  { id: 'community', label: 'コミュニティ', icon: '👥' },
  { id: 'mypage',    label: 'マイページ',   icon: '👤' },
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
