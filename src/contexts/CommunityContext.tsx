import { createContext, useContext, useState, ReactNode } from 'react'

interface CommunityContextType {
  joinedIds: number[]
  join: (id: number) => void
  leave: (id: number) => void
  isJoined: (id: number) => boolean
}

const CommunityContext = createContext<CommunityContextType | null>(null)

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const [joinedIds, setJoinedIds] = useState<number[]>([])

  const join = (id: number) => {
    setJoinedIds(prev => prev.includes(id) ? prev : [...prev, id])
  }

  const leave = (id: number) => {
    setJoinedIds(prev => prev.filter(i => i !== id))
  }

  const isJoined = (id: number) => joinedIds.includes(id)

  return (
    <CommunityContext.Provider value={{ joinedIds, join, leave, isJoined }}>
      {children}
    </CommunityContext.Provider>
  )
}

export const useCommunity = () => {
  const ctx = useContext(CommunityContext)
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider')
  return ctx
}
