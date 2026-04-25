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
import { User } from './types/user'

function App() {
  const {
    myAge,
    setMyAge,
    currentUser,
    likedUsers,
    skippedUsers,
    activeTab,
    setActiveTab,
    findRandomUser,
    handleLike,
    handleSkip,
    removeLiked,
    removeSkipped,
  } = useMatchingApp()

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showProfileDetail, setShowProfileDetail] = useState(false)

  const handleProfileClick = (user: User) => {
    setSelectedUser(user)
    setShowProfileDetail(true)
  }

  const handleCloseProfileDetail = () => {
    setShowProfileDetail(false)
    setSelectedUser(null)
  }

  return (
    <div className="app-container">
      <h1><img src={logo} className="base" width="200" alt="SubS" /></h1>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        likedCount={likedUsers.length}
        skippedCount={skippedUsers.length}
      />

      {activeTab === 'search' && (
        <>
          <SearchSection
            myAge={myAge}
            onAgeChange={setMyAge}
            onSearch={findRandomUser}
          />
          <ProfileCard
            user={currentUser}
            myAge={myAge}
            onLike={handleLike}
            onSkip={handleSkip}
            onProfileClick={handleProfileClick}
          />
        </>
      )}

      {activeTab === 'liked' && (
        <UserListTab
          users={likedUsers}
          title={`いいねした相手 (${likedUsers.length})`}
          onRemove={removeLiked}
          onProfileClick={handleProfileClick}
        />
      )}

      {activeTab === 'skipped' && (
        <UserListTab
          users={skippedUsers}
          title={`スキップした相手 (${skippedUsers.length})`}
          onRemove={removeSkipped}
          onProfileClick={handleProfileClick}
        />
      )}

      {activeTab === 'mypage' && (
        <MyPage
          likedCount={likedUsers.length}
          skippedCount={skippedUsers.length}
        />
      )}

      {showProfileDetail && selectedUser && (
        <ProfileDetail
          user={selectedUser}
          onBack={handleCloseProfileDetail}
        />
      )}
    </div>
  )
}

export default App
