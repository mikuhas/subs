import './App.css'
import logo from './assets/logo.png'
import { useState, useEffect } from 'react'
import { errorEmitter } from './lib/errorEmitter'
import { ErrorModal } from './components/ui/ErrorModal'
import { useMatchingApp } from './hooks/useMatchingApp'
import { TabNavigation } from './components/ui/TabNavigation'
import { SearchSection } from './components/pages/search/SearchSection'
import { SearchModal } from './components/pages/search/SearchModal'
import { ProfileCard } from './components/ui/ProfileCard'
import { ProfileDetail } from './components/ui/ProfileDetail'
import { ActivityPage } from './components/pages/activity/ActivityPage'
import { MyPage } from './components/pages/mypage/MyPage'
import { CommunityPage } from './components/pages/community/CommunityPage'
import { MessagesPage } from './components/pages/messages/MessagesPage'
import { ConversationView } from './components/pages/messages/ConversationView'
import { LoginPage } from './components/pages/auth/LoginPage'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { FitCheckPage } from './components/pages/fitcheck/FitCheckPage'
import { ReviewModal } from './components/ui/ReviewModal'
import { MatchPopup } from './components/ui/MatchPopup'
import { UserBoardPage } from './components/pages/userboard/UserBoardPage'
import { ReviewProvider } from './contexts/ReviewContext'
import { useAuth } from './contexts/AuthContext'
import { useMessage } from './contexts/MessageContext'
import { User } from './types/user'

function MainApp() {
  const { profile } = useAuth()
  const { conversationUserIds, subscribeToConversation } = useMessage()

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
    ageMin,
    setAgeMin,
    ageMax,
    setAgeMax,
    selectedBodyType,
    setSelectedBodyType,
    selectedFirstDateSituation,
    setSelectedFirstDateSituation,
    activeFilterCount,
    resetFilters,
    hasSearched,
    noResults,
    clearNoResults,
    findRandomUser,
    doRandomMatch,
    handleLike,
    handleSkip,
    handleLikeBack,
    clearNewMatch,
    dismissReceivedLike,
    removeLiked,
    removeSkipped,
    removeMatched,
    newMatch,
  } = useMatchingApp(profile?.age)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [boardUser, setBoardUser] = useState<User | null>(null)
  const [conversationUser, setConversationUser] = useState<User | null>(null)
  const [showFitCheck, setShowFitCheck] = useState(false)
  const [reviewUser, setReviewUser] = useState<User | null>(null)

  useEffect(() => {
    if (!matchedUsers.length) return
    const unsubscribes = matchedUsers.map(u => subscribeToConversation(u.id))
    return () => unsubscribes.forEach(fn => fn())
  }, [matchedUsers, subscribeToConversation])

  const openBoard = (user: User) => {
    setSelectedUser(null)
    setBoardUser(user)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1><img src={logo} className="base" width="160" alt="SubS" /></h1>
      </header>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setShowFitCheck(false); setBoardUser(null) }}
        receivedLikesCount={receivedLikes.length}
        messageCount={conversationUserIds.length}
      />

      <main className="app-main">
        {boardUser ? (
          <UserBoardPage user={boardUser} onBack={() => setBoardUser(null)} />
        ) : (
          <>
            {activeTab === 'search' && (
              <>
                <SearchSection
                  activeFilterCount={activeFilterCount}
                  activeFilterChips={[
                    selectedLine && `🚃 ${selectedLine}`,
                    selectedCommunityId !== '' && `👥 コミュニティ`,
                    (ageMin !== '' || ageMax !== '') && `🎂 ${ageMin || '—'}〜${ageMax || '—'}歳`,
                    selectedBodyType && `👕 ${selectedBodyType}`,
                    selectedFirstDateSituation && `💑 ${selectedFirstDateSituation}`,
                  ].filter(Boolean) as string[]}
                  onOpenModal={() => setShowSearchModal(true)}
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
                profileAge={profile?.age}
                onRandomMatch={doRandomMatch}
                onRemoveMatched={removeMatched}
                onProfileClick={user => setSelectedUser(user)}
                onMessage={user => setConversationUser(user)}
                onLikeBack={handleLikeBack}
                onDismiss={dismissReceivedLike}
                onReview={user => setReviewUser(user)}
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
                    <button className="fitcheck-back-btn" onClick={() => setShowFitCheck(false)}>← マイページへ戻る</button>
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
          </>
        )}
      </main>

      {showSearchModal && (
        <SearchModal
          selectedLine={selectedLine}
          selectedCommunityId={selectedCommunityId}
          ageMin={ageMin}
          ageMax={ageMax}
          selectedBodyType={selectedBodyType}
          selectedFirstDateSituation={selectedFirstDateSituation}
          onLineChange={setSelectedLine}
          onCommunityChange={setSelectedCommunityId}
          onAgeMinChange={setAgeMin}
          onAgeMaxChange={setAgeMax}
          onBodyTypeChange={setSelectedBodyType}
          onFirstDateSituationChange={setSelectedFirstDateSituation}
          onReset={resetFilters}
          onApply={() => { setShowSearchModal(false); findRandomUser() }}
          onClose={() => setShowSearchModal(false)}
        />
      )}

      {selectedUser && (
        <ProfileDetail
          user={selectedUser}
          onBack={() => setSelectedUser(null)}
          onOpenBoard={openBoard}
        />
      )}

      {conversationUser && (
        <ConversationView
          user={conversationUser}
          onClose={() => setConversationUser(null)}
        />
      )}

      {reviewUser && (
        <ReviewModal
          user={reviewUser}
          onClose={() => setReviewUser(null)}
          onSubmit={() => setReviewUser(null)}
        />
      )}

      {newMatch && (
        <MatchPopup user={newMatch} onClose={clearNewMatch} />
      )}

      {noResults && (
        <div className="modal-overlay" onClick={clearNoResults}>
          <div className="no-results-alert" onClick={e => e.stopPropagation()}>
            <div className="no-results-alert-icon">🔍</div>
            <h3 className="no-results-alert-title">相手が見つかりませんでした</h3>
            <p className="no-results-alert-body">
              条件に合う相手が現在いません。<br />
              沿線・コミュニティの条件を変えるか、<br />
              時間をおいて再度お試しください。
            </p>
            <button className="no-results-alert-btn" onClick={clearNoResults}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const { isLoggedIn, initializing } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    errorEmitter.setHandler(setErrorMessage)
  }, [])

  if (initializing) return <LoadingScreen />

  return (
    <ReviewProvider>
      {isLoggedIn ? <MainApp /> : <LoginPage />}
      {errorMessage && (
        <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
    </ReviewProvider>
  )
}

export default App
