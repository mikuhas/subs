import './App.css'
import logo from './assets/logo.png'
import { useState } from 'react'
import { useMatchingApp } from './hooks/useMatchingApp'
import { TabNavigation } from './components/TabNavigation'
import { SearchSection } from './components/SearchSection'
import { ProfileCard } from './components/ProfileCard'
import { ProfileDetail } from './components/ProfileDetail'
import { UserListTab } from './components/pages/layouts/UserListTab'
import { MyPage } from './components/pages/mypage/MyPage'
import { CommunityPage } from './components/pages/community/CommunityPage'
import { MessagesPage } from './components/pages/messages/MessagesPage'
import { ConversationView } from './components/pages/messages/ConversationView'
import { LoginPage } from './components/pages/auth/LoginPage'
import { useAuth } from './contexts/AuthContext'
import { useMessage } from './contexts/MessageContext'
import { User } from './types/user'

function MainApp() {
  const { profile } = useAuth()
  const { conversationUserIds } = useMessage()

  const {
    currentUser,
    likedUsers,
    skippedUsers,
    activeTab,
    setActiveTab,
    selectedLine,
    setSelectedLine,
    selectedCommunityId,
    setSelectedCommunityId,
    hasSearched,
    findRandomUser,
    handleLike,
    handleSkip,
    removeLiked,
    removeSkipped,
  } = useMatchingApp(profile?.age)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [conversationUser, setConversationUser] = useState<User | null>(null)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1><img src={logo} className="base" width="160" alt="SubS" /></h1>
      </header>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        likedCount={likedUsers.length}
        skippedCount={skippedUsers.length}
        messageCount={conversationUserIds.length}
      />

      <main className="app-main">
        {activeTab === 'search' && (
          <>
            <SearchSection
              profileAge={profile?.age}
              selectedLine={selectedLine}
              onLineChange={setSelectedLine}
              selectedCommunityId={selectedCommunityId}
              onCommunityChange={setSelectedCommunityId}
              onSearch={findRandomUser}
            />
            <ProfileCard
              user={currentUser}
              hasSearched={hasSearched}
              onLike={handleLike}
              onSkip={handleSkip}
              onProfileClick={user => setSelectedUser(user)}
            />
          </>
        )}

        {activeTab === 'liked' && (
          <UserListTab
            users={likedUsers}
            title={`いいねした相手 (${likedUsers.length})`}
            showMessageButton
            onRemove={removeLiked}
            onProfileClick={user => setSelectedUser(user)}
            onMessage={user => setConversationUser(user)}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesPage
            likedUsers={likedUsers}
            onOpenConversation={user => setConversationUser(user)}
          />
        )}

        {activeTab === 'skipped' && (
          <UserListTab
            users={skippedUsers}
            title={`スキップした相手 (${skippedUsers.length})`}
            onRemove={removeSkipped}
            onProfileClick={user => setSelectedUser(user)}
          />
        )}

        {activeTab === 'community' && <CommunityPage />}

        {activeTab === 'mypage' && (
          <MyPage likedCount={likedUsers.length} skippedCount={skippedUsers.length} />
        )}
      </main>

      {selectedUser && (
        <ProfileDetail
          user={selectedUser}
          onBack={() => setSelectedUser(null)}
        />
      )}

      {conversationUser && (
        <ConversationView
          user={conversationUser}
          onClose={() => setConversationUser(null)}
        />
      )}
    </div>
  )
}

function App() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <MainApp /> : <LoginPage />
}

export default App
