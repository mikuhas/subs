import { createContext, useContext, useState, ReactNode } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Community } from '../types/community'
import { COMMUNITIES, JOIN_COMMUNITY, LEAVE_COMMUNITY } from '../lib/graphql/operations'
import { mockCommunities } from '../data/communities'

interface CommunityContextType {
  communities: Community[]
  loading: boolean
  joinedIds: number[]
  join: (id: number) => void
  leave: (id: number) => void
  isJoined: (id: number) => boolean
}

const CommunityContext = createContext<CommunityContextType | null>(null)

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

const MockCommunityProvider = ({ children }: { children: ReactNode }) => {
  const [joinedIds, setJoinedIds] = useState<number[]>([])

  const join = (id: number) => setJoinedIds(prev => prev.includes(id) ? prev : [...prev, id])
  const leave = (id: number) => setJoinedIds(prev => prev.filter(i => i !== id))
  const isJoined = (id: number) => joinedIds.includes(id)

  return (
    <CommunityContext.Provider value={{ communities: mockCommunities, loading: false, joinedIds, join, leave, isJoined }}>
      {children}
    </CommunityContext.Provider>
  )
}

const RealCommunityProvider = ({ children }: { children: ReactNode }) => {
  const [joinedIds, setJoinedIds] = useState<number[]>([])

  const { data, loading } = useQuery(COMMUNITIES)
  const [joinMutation] = useMutation(JOIN_COMMUNITY)
  const [leaveMutation] = useMutation(LEAVE_COMMUNITY)

  const communities: Community[] = (data?.communities ?? []).map((c: {
    id: string; name: string; tag: string; description?: string | null
    iconClass: string; memberCount: number
  }) => ({
    id: parseInt(c.id),
    name: c.name,
    tag: c.tag,
    description: c.description ?? '',
    iconClass: c.iconClass,
    memberCount: c.memberCount,
  }))

  const join = (id: number) => {
    setJoinedIds(prev => prev.includes(id) ? prev : [...prev, id])
    joinMutation({ variables: { communityId: String(id) } })
  }

  const leave = (id: number) => {
    setJoinedIds(prev => prev.filter(i => i !== id))
    leaveMutation({ variables: { communityId: String(id) } })
  }

  const isJoined = (id: number) => joinedIds.includes(id)

  return (
    <CommunityContext.Provider value={{ communities, loading, joinedIds, join, leave, isJoined }}>
      {children}
    </CommunityContext.Provider>
  )
}

export const CommunityProvider = isMock ? MockCommunityProvider : RealCommunityProvider

export const useCommunity = () => {
  const ctx = useContext(CommunityContext)
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider')
  return ctx
}
