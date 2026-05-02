import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { User } from '../types/user'
import { useAuth } from '../contexts/AuthContext'
import { CANDIDATES, SWIPE_USER, RECEIVED_LIKES, MATCHES } from '../lib/graphql/operations'
import { mockUsers } from '../data/users'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

const mapApiUser = (u: {
  id: string; name: string; age: number; bio?: string | null
  imageUrl?: string | null; line?: string | null
  communityIds: number[]; distanceKm?: number | null
  sentLikeCount?: number | null; sentSkipCount?: number | null
  firstDateStation?: string | null; bodyType?: string | null
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
  firstDateStation: u.firstDateStation ?? undefined,
  bodyType: u.bodyType ?? undefined,
})

const useMockMatchingApp = (_profileAge?: number) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedUsers, setLikedUsers]     = useState<User[]>([])
  const [skippedUsers, setSkippedUsers] = useState<User[]>([])
  const [matchedUsers, setMatchedUsers] = useState<User[]>([])
  const [hiddenMatchIds, setHiddenMatchIds] = useState<Set<number>>(new Set())
  const [newMatch, setNewMatch]         = useState<User | null>(null)
  const [activeTab, setActiveTab]       = useState<'search' | 'activity' | 'messages' | 'community' | 'mypage'>('search')

  const [selectedLine, setSelectedLine] = useState('')
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | ''>('')
  const [ageMin, setAgeMin] = useState<number | ''>('')
  const [ageMax, setAgeMax] = useState<number | ''>('')
  const [selectedBodyType, setSelectedBodyType] = useState('')
  const [selectedFirstDateSituation, setSelectedFirstDateSituation] = useState('')

  const [hasSearched, setHasSearched] = useState(false)
  const [noResults, setNoResults]     = useState(false)

  // 末尾のユーザーを受け取ったいいね候補として初期化
  const [pendingReceivedLikes, setPendingReceivedLikes] = useState<User[]>(
    () => mockUsers.slice(-1),
  )

  const filteredCandidates = useMemo(() => {
    const matchedIds = new Set(matchedUsers.map(u => u.id))
    const receivedIds = new Set(pendingReceivedLikes.map(u => u.id))
    return mockUsers.filter(u => {
      if (matchedIds.has(u.id)) return false
      if (receivedIds.has(u.id)) return false
      if (ageMin !== '' && u.age < ageMin) return false
      if (ageMax !== '' && u.age > ageMax) return false
      if (selectedLine && u.line !== selectedLine) return false
      if (selectedCommunityId && !u.communityIds.includes(selectedCommunityId as number)) return false
      if (selectedBodyType && u.bodyType !== selectedBodyType) return false
      if (selectedFirstDateSituation && u.firstDateStation !== selectedFirstDateSituation) return false
      return true
    })
  }, [matchedUsers, pendingReceivedLikes, ageMin, ageMax, selectedLine, selectedCommunityId, selectedBodyType, selectedFirstDateSituation])

  const receivedLikes: User[] = useMemo(() => {
    const matchedIds = new Set(matchedUsers.map(u => u.id))
    return pendingReceivedLikes.filter(u => !matchedIds.has(u.id))
  }, [pendingReceivedLikes, matchedUsers])

  const currentUser = filteredCandidates[currentIndex] ?? null

  const handleLike = useCallback(async () => {
    if (!currentUser) return
    setHasSearched(true)
    setLikedUsers(prev => prev.some(u => u.id === currentUser.id) ? prev : [...prev, currentUser])
    if (Math.random() < 0.3) {
      setMatchedUsers(prev => prev.some(u => u.id === currentUser.id) ? prev : [...prev, currentUser])
      setNewMatch(currentUser)
    }
    setCurrentIndex(prev => prev + 1)
  }, [currentUser])

  const handleSkip = useCallback(async () => {
    if (!currentUser) return
    setHasSearched(true)
    setSkippedUsers(prev => prev.some(u => u.id === currentUser.id) ? prev : [...prev, currentUser])
    setCurrentIndex(prev => prev + 1)
  }, [currentUser])

  const findRandomUser = useCallback(async () => {
    setHasSearched(true)
    setCurrentIndex(0)
    setNoResults(false)
    const matchedIds = new Set(matchedUsers.map(u => u.id))
    const visible = mockUsers.filter(u => {
      if (matchedIds.has(u.id)) return false
      if (ageMin !== '' && u.age < ageMin) return false
      if (ageMax !== '' && u.age > ageMax) return false
      if (selectedLine && u.line !== selectedLine) return false
      if (selectedCommunityId !== '' && !u.communityIds.includes(selectedCommunityId as number)) return false
      if (selectedBodyType && u.bodyType !== selectedBodyType) return false
      if (selectedFirstDateSituation && u.firstDateStation !== selectedFirstDateSituation) return false
      return true
    })
    if (visible.length === 0) setNoResults(true)
  }, [matchedUsers, ageMin, ageMax, selectedLine, selectedCommunityId, selectedBodyType, selectedFirstDateSituation])

  const clearNoResults = useCallback(() => setNoResults(false), [])
  const findRandomMatchUser = findRandomUser

  const resetFilters = useCallback(() => {
    setSelectedLine('')
    setSelectedCommunityId('')
    setAgeMin('')
    setAgeMax('')
    setSelectedBodyType('')
    setSelectedFirstDateSituation('')
  }, [])

  const doRandomMatch = useCallback(() => {
    if (!currentUser) return
    setMatchedUsers(prev => prev.some(u => u.id === currentUser.id) ? prev : [...prev, currentUser])
    setNewMatch(currentUser)
  }, [currentUser])

  const handleLikeBack = useCallback(async (user: User) => {
    setMatchedUsers(prev => prev.some(u => u.id === user.id) ? prev : [...prev, user])
    setNewMatch(user)
    setPendingReceivedLikes(prev => prev.filter(u => u.id !== user.id))
  }, [])

  const dismissReceivedLike = useCallback(async (id: number) => {
    setPendingReceivedLikes(prev => prev.filter(u => u.id !== id))
  }, [])

  const clearNewMatch = useCallback(() => setNewMatch(null), [])
  const removeLiked   = useCallback((id: number) => setLikedUsers(prev => prev.filter(u => u.id !== id)), [])
  const removeSkipped = useCallback((id: number) => setSkippedUsers(prev => prev.filter(u => u.id !== id)), [])
  const removeMatched = useCallback((id: number) => setHiddenMatchIds(prev => new Set([...prev, id])), [])

  const visibleMatches = useMemo(
    () => matchedUsers.filter(u => !hiddenMatchIds.has(u.id)),
    [matchedUsers, hiddenMatchIds],
  )

  const activeFilterCount = useMemo(() => [
    !!selectedLine,
    selectedCommunityId !== '',
    ageMin !== '' || ageMax !== '',
    !!selectedBodyType,
    !!selectedFirstDateSituation,
  ].filter(Boolean).length, [selectedLine, selectedCommunityId, ageMin, ageMax, selectedBodyType, selectedFirstDateSituation])

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
    activeTab, selectedLine, selectedCommunityId,
    ageMin, ageMax, selectedBodyType, selectedFirstDateSituation,
    activeFilterCount, resetFilters,
    hasSearched, noResults, clearNoResults,
    findRandomUser, findRandomMatchUser, doRandomMatch,
    handleLike, handleSkip, handleLikeBack, clearNewMatch,
    dismissReceivedLike, removeLiked, removeSkipped, removeMatched,
  ])
}

// profileAge は後方互換のため残すが API フィルタは不要（サーバー側で処理）
const useRealMatchingApp = (_profileAge?: number) => {
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
  const [ageMin, setAgeMin] = useState<number | ''>('')
  const [ageMax, setAgeMax] = useState<number | ''>('')
  const [selectedBodyType, setSelectedBodyType] = useState('')
  const [selectedFirstDateSituation, setSelectedFirstDateSituation] = useState('')

  const [hasSearched, setHasSearched] = useState(false)
  const [noResults, setNoResults]     = useState(false)

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
    const matchedIds = new Set(matchedUsers.map(u => u.id))
    return receivedLikesData.receivedLikes
      .map(mapApiUser)
      .filter((u: User) => !matchedIds.has(u.id))
  }, [receivedLikesData, matchedUsers])

  const [swipeUserMutation] = useMutation(SWIPE_USER)

  const allCandidates: User[] = useMemo(() => {
    if (!candidatesData?.candidates) return []
    return candidatesData.candidates.map(mapApiUser)
  }, [candidatesData])

  const filteredCandidates = useMemo(() => {
    const matchedIds = new Set(matchedUsers.map(u => u.id))
    return allCandidates.filter(u => {
      if (matchedIds.has(u.id)) return false
      if (ageMin !== '' && u.age < ageMin) return false
      if (ageMax !== '' && u.age > ageMax) return false
      if (selectedLine && u.line !== selectedLine) return false
      if (selectedCommunityId && !u.communityIds.includes(selectedCommunityId as number)) return false
      if (selectedBodyType && u.bodyType !== selectedBodyType) return false
      if (selectedFirstDateSituation && u.firstDateStation !== selectedFirstDateSituation) return false
      return true
    })
  }, [allCandidates, matchedUsers, ageMin, ageMax, selectedLine, selectedCommunityId, selectedBodyType, selectedFirstDateSituation])

  const activeFilterCount = useMemo(() => [
    !!selectedLine,
    selectedCommunityId !== '',
    ageMin !== '' || ageMax !== '',
    !!selectedBodyType,
    !!selectedFirstDateSituation,
  ].filter(Boolean).length, [selectedLine, selectedCommunityId, ageMin, ageMax, selectedBodyType, selectedFirstDateSituation])

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
    const raw: { line?: string | null; communityIds: number[]; age: number; bodyType?: string | null; firstDateStation?: string | null }[] = data?.candidates ?? []
    const matchedIds = new Set(matchedUsers.map(u => u.id))
    const visible = raw.filter((u: { id: string; line?: string | null; communityIds: number[]; age: number; bodyType?: string | null; firstDateStation?: string | null }) => {
      if (matchedIds.has(parseInt(u.id))) return false
      if (ageMin !== '' && u.age < ageMin) return false
      if (ageMax !== '' && u.age > ageMax) return false
      if (selectedLine && u.line !== selectedLine) return false
      if (selectedCommunityId !== '' && !u.communityIds.includes(selectedCommunityId as number)) return false
      if (selectedBodyType && u.bodyType !== selectedBodyType) return false
      if (selectedFirstDateSituation && u.firstDateStation !== selectedFirstDateSituation) return false
      return true
    })
    if (visible.length === 0) setNoResults(true)
  }, [refetch, matchedUsers, ageMin, ageMax, selectedLine, selectedCommunityId, selectedBodyType, selectedFirstDateSituation])

  const clearNoResults = useCallback(() => setNoResults(false), [])
  const findRandomMatchUser = findRandomUser

  const resetFilters = useCallback(() => {
    setSelectedLine('')
    setSelectedCommunityId('')
    setAgeMin('')
    setAgeMax('')
    setSelectedBodyType('')
    setSelectedFirstDateSituation('')
  }, [])

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
    activeTab, selectedLine, selectedCommunityId,
    ageMin, ageMax, selectedBodyType, selectedFirstDateSituation,
    activeFilterCount, resetFilters,
    hasSearched, noResults, clearNoResults,
    findRandomUser, findRandomMatchUser, doRandomMatch,
    handleLike, handleSkip, handleLikeBack, clearNewMatch,
    dismissReceivedLike, removeLiked, removeSkipped, removeMatched,
  ])
}

export const useMatchingApp = isMock ? useMockMatchingApp : useRealMatchingApp
