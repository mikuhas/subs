import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Message } from '../types/message'
import { useAuth } from './AuthContext'
import { sendFirestoreMessage, subscribeToMessages } from '../lib/firestoreMessages'

export interface Intention {
  icon: string
  label: string
}

interface MessageContextType {
  sendMessage: (userId: number, text: string) => Promise<void>
  subscribeToConversation: (userId: number) => () => void
  getMessages: (userId: number) => Message[]
  hasConversation: (userId: number) => boolean
  conversationUserIds: number[]
  setIntention: (userId: number, intention: Intention | null) => void
  getIntention: (userId: number) => Intention | null
}

const MessageContext = createContext<MessageContextType | null>(null)

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth()
  const [conversations, setConversations] = useState<Record<number, Message[]>>({})
  const [intentions, setIntentions] = useState<Record<number, Intention | null>>({})

  const sendMessage = useCallback(async (userId: number, text: string) => {
    if (!profile?.id) return
    // 楽観的 UI: Firestore の onSnapshot が届く前に即時表示
    const optimistic: Message = { id: `opt_${Date.now()}`, text, fromMe: true, timestamp: Date.now() }
    setConversations(prev => ({ ...prev, [userId]: [...(prev[userId] ?? []), optimistic] }))
    await sendFirestoreMessage(profile.id, userId, text)
  }, [profile?.id])

  const subscribeToConversation = useCallback((userId: number): (() => void) => {
    if (!profile?.id) return () => {}
    return subscribeToMessages(profile.id, userId, msgs => {
      setConversations(prev => ({ ...prev, [userId]: msgs }))
    })
  }, [profile?.id])

  const getMessages = (userId: number) => conversations[userId] ?? []
  const hasConversation = (userId: number) => (conversations[userId]?.length ?? 0) > 0
  const conversationUserIds = Object.keys(conversations).map(Number).filter(id => (conversations[id]?.length ?? 0) > 0)

  const setIntention = (userId: number, intention: Intention | null) =>
    setIntentions(prev => ({ ...prev, [userId]: intention }))
  const getIntention = (userId: number) => intentions[userId] ?? null

  return (
    <MessageContext.Provider value={{ sendMessage, subscribeToConversation, getMessages, hasConversation, conversationUserIds, setIntention, getIntention }}>
      {children}
    </MessageContext.Provider>
  )
}

export const useMessage = () => {
  const ctx = useContext(MessageContext)
  if (!ctx) throw new Error('useMessage must be used within MessageProvider')
  return ctx
}
