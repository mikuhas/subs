import './App.css'
import logo from './assets/logo.png'
import { useState } from 'react'
import { useMatchingApp } from './composables/useMatchingApp'
import { TabNavigation } from './components/ui/TabNavigation'
import { SearchSection } from './components/ui/SearchSection'
import { ProfileCard } from './components/ui/ProfileCard'
import { ProfileDetail } from './components/ui/ProfileDetail'
import { ActivityPage } from './components/layouts/ActivityPage'
import { MyPage } from './components/pages/mypage/MyPage'
import { CommunityPage } from './components/pages/community/CommunityPage'
import { MessagesPage } from './components/pages/messages/MessagesPage'
import { ConversationView } from './components/pages/messages/ConversationView'
import { LoginPage } from './components/pages/auth/LoginPage'
import { FitCheckPage } from './components/pages/fitcheck/FitCheckPage'
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
    matchedUsers,
    receivedLikes,
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
    handleLikeBack,
    dismissReceivedLike,
    removeLiked,
    removeSkipped,
    removeMatched,
  } = useMatchingApp(profile?.age)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [conversationUser, setConversationUser] = useState<User | null>(null)
  const [showFitCheck, setShowFitCheck] = useState(false)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1><img src={logo} className="base" width="160" alt="SubS" /></h1>
      </header>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setShowFitCheck(false) }}
        receivedLikesCount={receivedLikes.length}
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

        {activeTab === 'activity' && (
          <ActivityPage
            matchedUsers={matchedUsers}
            receivedLikes={receivedLikes}
            onRemoveMatched={removeMatched}
            onProfileClick={user => setSelectedUser(user)}
            onMessage={user => setConversationUser(user)}
            onLikeBack={handleLikeBack}
            onDismiss={dismissReceivedLike}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesPage
            matchedUsers={matchedUsers}
            onOpenConversation={user => setConversationUser(user)}
          />
        )}

        {activeTab === 'community' && <CommunityPage />}

        {activeTab === 'mypage' && (
          showFitCheck
            ? (
              <div>
                <button className="fitcheck-back-btn" onClick={() => setShowFitCheck(false)}>← マイページに戻る</button>
                <FitCheckPage />
              </div>
            )
            : <MyPage
                likedUsers={likedUsers}
                skippedUsers={skippedUsers}
                onRemoveLiked={removeLiked}
                onRemoveSkipped={removeSkipped}
                onProfileClick={user => setSelectedUser(user)}
                onOpenFitCheck={() => setShowFitCheck(true)}
              />
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
