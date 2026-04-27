import { useState, useEffect } from 'react'
import { User } from '../types/user'
import { getRandomUserByAge } from '../utils/userService'

export const useMatchingApp = (profileAge?: number) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [likedUsers, setLikedUsers] = useState<User[]>([])
  const [skippedUsers, setSkippedUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'liked' | 'messages' | 'skipped' | 'community' | 'mypage'>('search')
  const [selectedLine, setSelectedLine] = useState('')
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | ''>('')
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    setCurrentUser(null)
    setHasSearched(false)
  }, [selectedLine, selectedCommunityId])

  const findRandomUser = () => {
    if (!profileAge || profileAge === 0) {
      alert('マイページで年齢を設定してください')
      return
    }
    setHasSearched(true)
    const excludeIds = [...likedUsers.map(u => u.id), ...skippedUsers.map(u => u.id)]
    const user = getRandomUserByAge(
      profileAge,
      excludeIds,
      selectedLine || undefined,
      selectedCommunityId || undefined,
    )
    if (!user) {
      alert('条件に合致する相手が見つかりませんでした')
      setCurrentUser(null)
      return
    }
    setCurrentUser(user)
  }

  const findNextUser = (excludeIds: number[]) => {
    if (!profileAge || profileAge === 0) { setCurrentUser(null); return }
    const user = getRandomUserByAge(
      profileAge,
      excludeIds,
      selectedLine || undefined,
      selectedCommunityId || undefined,
    )
    setCurrentUser(user)
  }

  const handleLike = () => {
    if (!currentUser || likedUsers.find(u => u.id === currentUser.id)) return
    const newLiked = [...likedUsers, currentUser]
    const newSkipped = skippedUsers.filter(u => u.id !== currentUser.id)
    setLikedUsers(newLiked)
    setSkippedUsers(newSkipped)
    findNextUser([...newLiked.map(u => u.id), ...newSkipped.map(u => u.id)])
  }

  const handleSkip = () => {
    if (!currentUser || skippedUsers.find(u => u.id === currentUser.id)) return
    const newSkipped = [...skippedUsers, currentUser]
    const newLiked = likedUsers.filter(u => u.id !== currentUser.id)
    setSkippedUsers(newSkipped)
    setLikedUsers(newLiked)
    findNextUser([...newLiked.map(u => u.id), ...newSkipped.map(u => u.id)])
  }

  const removeLiked = (id: number) => setLikedUsers(likedUsers.filter(u => u.id !== id))
  const removeSkipped = (id: number) => setSkippedUsers(skippedUsers.filter(u => u.id !== id))

  return {
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
  }
}
