import { useState, useEffect, useCallback, useMemo } from 'react'
import { User } from '../types/user'
import { getRandomUserByAge, getCompletelyRandomUser } from '../utils/userService'
import { mockUsers } from '../data/users'

export const useMatchingApp = (profileAge?: number) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [likedUsers, setLikedUsers] = useState<User[]>([])
  const [skippedUsers, setSkippedUsers] = useState<User[]>([])
  const [matchedUsers, setMatchedUsers] = useState<User[]>([])
  const [receivedLikes, setReceivedLikes] = useState<User[]>(() => mockUsers.slice(0, 2))
  const [newMatch, setNewMatch] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'activity' | 'messages' | 'community' | 'mypage'>('search')
  const [selectedLine, setSelectedLine] = useState('')
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | ''>('')
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    setCurrentUser(null)
    setHasSearched(false)
  }, [selectedLine, selectedCommunityId])

  const findRandomUser = useCallback(() => {
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
  }, [profileAge, likedUsers, skippedUsers, selectedLine, selectedCommunityId])

  const findNextUser = useCallback((excludeIds: number[]) => {
    if (!profileAge || profileAge === 0) { setCurrentUser(null); return }
    const user = getRandomUserByAge(
      profileAge,
      excludeIds,
      selectedLine || undefined,
      selectedCommunityId || undefined,
    )
    setCurrentUser(user)
  }, [profileAge, selectedLine, selectedCommunityId])

  const findRandomMatchUser = useCallback(() => {
    if (!profileAge || profileAge === 0) {
      alert('マイページで年齢を設定してください')
      return
    }
    const excludeIds = [...likedUsers.map(u => u.id), ...skippedUsers.map(u => u.id)]
    const user = getCompletelyRandomUser(profileAge, excludeIds)
    if (user) {
      setCurrentUser(user)
      setHasSearched(true)
    } else {
      alert('条件に合う相手が見つかりませんでした')
    }
  }, [profileAge, likedUsers, skippedUsers])

  const doRandomMatch = useCallback(() => {
    if (!profileAge || profileAge === 0) {
      alert('マイページで年齢を設定してください')
      return
    }
    const excludeIds = [
      ...likedUsers.map(u => u.id),
      ...skippedUsers.map(u => u.id),
      ...matchedUsers.map(u => u.id),
    ]
    const user = getCompletelyRandomUser(profileAge, excludeIds)
    if (user) {
      setMatchedUsers(prev => [...prev, user])
      setNewMatch(user)
    } else {
      alert('条件に合う相手が見つかりませんでした')
    }
  }, [profileAge, likedUsers, skippedUsers, matchedUsers])

  const handleLike = useCallback(() => {
    if (!currentUser || likedUsers.some(u => u.id === currentUser.id)) return
    const newLiked = [...likedUsers, currentUser]
    const newSkipped = skippedUsers.filter(u => u.id !== currentUser.id)
    setLikedUsers(newLiked)
    setSkippedUsers(newSkipped)

    // いいねされたリストに居る相手 → 自動マッチング
    if (receivedLikes.some(u => u.id === currentUser.id)) {
      setMatchedUsers(prev => [...prev, currentUser])
      setReceivedLikes(prev => prev.filter(u => u.id !== currentUser.id))
      setNewMatch(currentUser)
    } else if (Math.random() < 0.6) {
      setMatchedUsers(prev => [...prev, currentUser])
      setNewMatch(currentUser)
    }

    findNextUser([...newLiked.map(u => u.id), ...newSkipped.map(u => u.id)])
  }, [currentUser, likedUsers, skippedUsers, receivedLikes, findNextUser])

  const handleSkip = useCallback(() => {
    if (!currentUser || skippedUsers.some(u => u.id === currentUser.id)) return
    const newSkipped = [...skippedUsers, currentUser]
    const newLiked = likedUsers.filter(u => u.id !== currentUser.id)
    setSkippedUsers(newSkipped)
    setLikedUsers(newLiked)
    findNextUser([...newLiked.map(u => u.id), ...newSkipped.map(u => u.id)])
  }, [currentUser, likedUsers, skippedUsers, findNextUser])

  // いいねされたリストからいいね返し → マッチング確定
  const handleLikeBack = useCallback((user: User) => {
    setMatchedUsers(prev => prev.some(u => u.id === user.id) ? prev : [...prev, user])
    setLikedUsers(prev => prev.some(u => u.id === user.id) ? prev : [...prev, user])
    setReceivedLikes(prev => prev.filter(u => u.id !== user.id))
    setNewMatch(user)
  }, [])

  const clearNewMatch = useCallback(() => setNewMatch(null), [])

  const dismissReceivedLike = useCallback((id: number) => {
    setReceivedLikes(prev => prev.filter(u => u.id !== id))
  }, [])

  const removeLiked = useCallback((id: number) => {
    setLikedUsers(prev => prev.filter(u => u.id !== id))
    setMatchedUsers(prev => prev.filter(u => u.id !== id))
  }, [])
  const removeSkipped = useCallback((id: number) => setSkippedUsers(prev => prev.filter(u => u.id !== id)), [])
  const removeMatched = useCallback((id: number) => setMatchedUsers(prev => prev.filter(u => u.id !== id)), [])

  return useMemo(() => ({
    currentUser,
    likedUsers,
    skippedUsers,
    matchedUsers,
    receivedLikes,
    newMatch,
    activeTab,
    setActiveTab,
    selectedLine,
    setSelectedLine,
    selectedCommunityId,
    setSelectedCommunityId,
    hasSearched,
    findRandomUser,
    findRandomMatchUser,
    doRandomMatch,
    handleLike,
    handleSkip,
    handleLikeBack,
    clearNewMatch,
    dismissReceivedLike,
    removeLiked,
    removeSkipped,
    removeMatched,
  }), [currentUser, likedUsers, skippedUsers, matchedUsers, receivedLikes, newMatch, activeTab, selectedLine, selectedCommunityId, hasSearched, findRandomUser, findRandomMatchUser, doRandomMatch, handleLike, handleSkip, handleLikeBack, clearNewMatch, dismissReceivedLike, removeLiked, removeSkipped, removeMatched])
}
