import { createContext, useContext, useState, ReactNode } from 'react'
import { useMutation } from '@apollo/client'
import { Message } from '../types/message'
import { SEND_MESSAGE } from '../lib/graphql/operations'

export interface Intention {
  icon: string
  label: string
}

interface MessageContextType {
  sendMessage: (userId: number, text: string) => void
  getMessages: (userId: number) => Message[]
  hasConversation: (userId: number) => boolean
  conversationUserIds: number[]
  setIntention: (userId: number, intention: Intention | null) => void
  getIntention: (userId: number) => Intention | null
}

const MessageContext = createContext<MessageContextType | null>(null)

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Record<number, Message[]>>({})
  const [intentions, setIntentions] = useState<Record<number, Intention | null>>({})

  const [sendMessageMutation] = useMutation(SEND_MESSAGE)

  const sendMessage = (userId: number, text: string) => {
    const msg: Message = { id: Date.now(), text, fromMe: true, timestamp: Date.now() }
    setConversations(prev => ({
      ...prev,
      [userId]: [...(prev[userId] ?? []), msg],
    }))

    // API 送信（楽観的 UI: ローカル追加後に非同期送信）
    sendMessageMutation({
      variables: { receiverId: String(userId), body: text },
    }).catch(console.error)
  }

  const getMessages = (userId: number) => conversations[userId] ?? []
  const hasConversation = (userId: number) => (conversations[userId]?.length ?? 0) > 0
  const conversationUserIds = Object.keys(conversations).map(Number)
  const setIntention = (userId: number, intention: Intention | null) =>
    setIntentions(prev => ({ ...prev, [userId]: intention }))
  const getIntention = (userId: number) => intentions[userId] ?? null

  return (
    <MessageContext.Provider value={{ sendMessage, getMessages, hasConversation, conversationUserIds, setIntention, getIntention }}>
      {children}
    </MessageContext.Provider>
  )
}

export const useMessage = () => {
  const ctx = useContext(MessageContext)
  if (!ctx) throw new Error('useMessage must be used within MessageProvider')
  return ctx
}
