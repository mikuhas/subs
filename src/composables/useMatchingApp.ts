import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { User } from '../types/user'
import { useAuth } from '../contexts/AuthContext'
import { CANDIDATES, SWIPE_USER, RECEIVED_LIKES, MATCHES } from '../lib/graphql/operations'

const mapApiUser = (u: {
  id: string; name: string; age: number; bio?: string | null
  imageUrl?: string | null; line?: string | null
  communityIds: number[]; distanceKm?: number | null
  sentLikeCount?: number | null; sentSkipCount?: number | null
}): User => ({
  id: parseInt(u.id),
  name: u.name,
  age: u.age,
  bio: u.bio ?? '',
  image: u.imageUrl ?? '',
  line: u.line ?? '',
  communityIds: u.communityIds,
  distanceKm: u.distanceKm ?? 0,
  sentLikeCount: u.sentLikeCount ?? 0,
  sentSkipCount: u.sentSkipCount ?? 0,
})

// profileAge は後方互換のため残すが API フィルタは不要（サーバー側で処理）
export const useMatchingApp = (_profileAge?: number) => {
  const { isLoggedIn } = useAuth()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedUsers, setLikedUsers]     = useState<User[]>([])
  const [skippedUsers, setSkippedUsers] = useState<User[]>([])
  const [matchedUsers, setMatchedUsers] = useState<User[]>([])
  const [hiddenMatchIds, setHiddenMatchIds] = useState<Set<number>>(new Set())
  const matchesLoaded = useRef(false)
  const [newMatch, setNewMatch]         = useState<User | null>(null)
  const [activeTab, setActiveTab]       = useState<'search' | 'activity' | 'messages' | 'community' | 'mypage'>('search')
  const [selectedLine, setSelectedLine] = useState('')
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | ''>('')
  const [hasSearched, setHasSearched]   = useState(false)
  const [noResults, setNoResults]       = useState(false)

  const { data: candidatesData, refetch } = useQuery(CANDIDATES, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
  })

  const { data: matchesData } = useQuery(MATCHES, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
  })

  // DB からマッチ済みユーザーを初期ロード
  useEffect(() => {
    if (!matchesData?.matches || matchesLoaded.current) return
    matchesLoaded.current = true
    const users: User[] = matchesData.matches.map((m: { partner: Parameters<typeof mapApiUser>[0] }) => mapApiUser(m.partner))
    setMatchedUsers(users)
  }, [matchesData])

  const { data: receivedLikesData, refetch: refetchReceivedLikes } = useQuery(RECEIVED_LIKES, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
  })

  const receivedLikes: User[] = useMemo(() => {
    if (!receivedLikesData?.receivedLikes) return []
    return receivedLikesData.receivedLikes.map(mapApiUser)
  }, [receivedLikesData])

  const [swipeUserMutation] = useMutation(SWIPE_USER)

  const allCandidates: User[] = useMemo(() => {
    if (!candidatesData?.candidates) return []
    return candidatesData.candidates.map(mapApiUser)
  }, [candidatesData])

  // ライン・コミュニティのフィルタはフロントエンドで適用
  const filteredCandidates = useMemo(() => allCandidates.filter(u => {
    if (selectedLine && u.line !== selectedLine) return false
    if (selectedCommunityId && !u.communityIds.includes(selectedCommunityId as number)) return false
    return true
  }), [allCandidates, selectedLine, selectedCommunityId])

  const currentUser = filteredCandidates[currentIndex] ?? null

  const handleLike = useCallback(async () => {
    if (!currentUser) return
    setHasSearched(true)
    setLikedUsers(prev => prev.some(u => u.id === currentUser.id) ? prev : [...prev, currentUser])

    const { data } = await swipeUserMutation({
      variables: { toUserId: String(currentUser.id), action: 'like' },
    })
    if (data?.swipeUser?.matched) {
      setMatchedUsers(prev => prev.some(u => u.id === currentUser.id) ? prev : [...prev, currentUser])
      setNewMatch(currentUser)
    }
    setCurrentIndex(prev => prev + 1)
  }, [currentUser, swipeUserMutation])

  const handleSkip = useCallback(async () => {
    if (!currentUser) return
    setHasSearched(true)
    setSkippedUsers(prev => prev.some(u => u.id === currentUser.id) ? prev : [...prev, currentUser])
    await swipeUserMutation({
      variables: { toUserId: String(currentUser.id), action: 'skip' },
    })
    setCurrentIndex(prev => prev + 1)
  }, [currentUser, swipeUserMutation])

  const findRandomUser = useCallback(async () => {
    setHasSearched(true)
    setCurrentIndex(0)
    setNoResults(false)
    const { data } = await refetch()
    const raw: { line?: string | null; communityIds: number[] }[] = data?.candidates ?? []
    const visible = raw.filter(u => {
      if (selectedLine && u.line !== selectedLine) return false
      if (selectedCommunityId !== '' && !u.communityIds.includes(selectedCommunityId as number)) return false
      return true
    })
    if (visible.length === 0) setNoResults(true)
  }, [refetch, selectedLine, selectedCommunityId])

  const clearNoResults = useCallback(() => setNoResults(false), [])
  const findRandomMatchUser = findRandomUser

  const doRandomMatch = useCallback(() => {
    if (!currentUser) return
    setMatchedUsers(prev => prev.some(u => u.id === currentUser.id) ? prev : [...prev, currentUser])
    setNewMatch(currentUser)
  }, [currentUser])

  const handleLikeBack = useCallback(async (user: User) => {
    const { data } = await swipeUserMutation({
      variables: { toUserId: String(user.id), action: 'like' },
    })
    if (data?.swipeUser?.matched) {
      setMatchedUsers(prev => prev.some(u => u.id === user.id) ? prev : [...prev, user])
      setNewMatch(user)
    }
    await refetchReceivedLikes()
  }, [swipeUserMutation, refetchReceivedLikes])

  const dismissReceivedLike = useCallback(async (id: number) => {
    await swipeUserMutation({
      variables: { toUserId: String(id), action: 'skip' },
    })
    await refetchReceivedLikes()
  }, [swipeUserMutation, refetchReceivedLikes])

  const clearNewMatch = useCallback(() => setNewMatch(null), [])
  const removeLiked   = useCallback((id: number) => setLikedUsers(prev => prev.filter(u => u.id !== id)), [])
  const removeSkipped = useCallback((id: number) => setSkippedUsers(prev => prev.filter(u => u.id !== id)), [])
  const removeMatched = useCallback((id: number) => setHiddenMatchIds(prev => new Set([...prev, id])), [])

  const visibleMatches = useMemo(
    () => matchedUsers.filter(u => !hiddenMatchIds.has(u.id)),
    [matchedUsers, hiddenMatchIds],
  )

  return useMemo(() => ({
    currentUser,
    likedUsers,
    skippedUsers,
    matchedUsers: visibleMatches,
    receivedLikes,
    newMatch,
    activeTab,
    setActiveTab,
    selectedLine,
    setSelectedLine,
    selectedCommunityId,
    setSelectedCommunityId,
    hasSearched,
    noResults,
    clearNoResults,
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
  }), [
    currentUser, likedUsers, skippedUsers, visibleMatches, receivedLikes, newMatch,
    activeTab, selectedLine, selectedCommunityId, hasSearched, noResults, clearNoResults,
    findRandomUser, findRandomMatchUser, doRandomMatch,
    handleLike, handleSkip, handleLikeBack, clearNewMatch,
    dismissReceivedLike, removeLiked, removeSkipped, removeMatched,
  ])
}
