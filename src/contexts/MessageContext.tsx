import { createContext, useContext, useState, ReactNode } from 'react'
import { Message } from '../types/message'

interface MessageContextType {
  sendMessage: (userId: number, text: string) => void
  getMessages: (userId: number) => Message[]
  hasConversation: (userId: number) => boolean
  conversationUserIds: number[]
}

const MessageContext = createContext<MessageContextType | null>(null)

const AUTO_REPLIES = [
  'そうなんですね！',
  'いいですね♪',
  'ぜひお話しましょう！',
  '私もそれが好きです！',
  'どこで会いましょうか？',
  'とても楽しそうですね！',
  'もっと教えてください！',
]

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Record<number, Message[]>>({})

  const sendMessage = (userId: number, text: string) => {
    const msg: Message = { id: Date.now(), text, fromMe: true, timestamp: Date.now() }
    setConversations(prev => ({
      ...prev,
      [userId]: [...(prev[userId] ?? []), msg],
    }))
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        fromMe: false,
        timestamp: Date.now() + 1000,
      }
      setConversations(prev => ({
        ...prev,
        [userId]: [...(prev[userId] ?? []), reply],
      }))
    }, 1200)
  }

  const getMessages = (userId: number) => conversations[userId] ?? []
  const hasConversation = (userId: number) => (conversations[userId]?.length ?? 0) > 0
  const conversationUserIds = Object.keys(conversations).map(Number)

  return (
    <MessageContext.Provider value={{ sendMessage, getMessages, hasConversation, conversationUserIds }}>
      {children}
    </MessageContext.Provider>
  )
}

export const useMessage = () => {
  const ctx = useContext(MessageContext)
  if (!ctx) throw new Error('useMessage must be used within MessageProvider')
  return ctx
}
