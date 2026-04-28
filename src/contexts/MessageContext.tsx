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
  // 既存のリスト
  'そうなんですね！',
  'いいですね♪',
  'ぜひお話しましょう！',
  '私もそれが好きです！',
  'どこで会いましょうか？',
  'とても楽しそうですね！',
  'もっと教えてください！',

  // --- 追加分：共感・リアクション ---
  '素敵ですね！センスがいいなと思いました。',
  'わかります！私もそういう雰囲気、すごく好きです。',
  'さすがですね！こだわりが感じられます。',
  '最高ですね！聞いているだけでワクワクします。',
  '意外な一面があって面白いですね（笑）',

  // --- 追加分：質問（会話を深める） ---
  '具体的にはどんなところが一番のおすすめですか？',
  'それ、いつ頃からハマってるんですか？',
  '最近行った中で、特にお気に入りだった場所はありますか？',
  '他にも似たようなジャンルで好きなものはありますか？',
  '初心者でも楽しめますかね？（笑）',

  // --- 追加分：自己開示・共通点 ---
  '実は私もそれ気になってたんです！奇遇ですね。',
  '私も似たような経験があるので、すごく共感しちゃいます。',
  '私はまだ詳しくないのですが、ぜひ詳しく教えてもらいたいです！',
  '休日は私も似たような過ごし方をすることが多いですよ。',

  // --- 追加分：ネクストアクション（誘い・提案） ---
  '気が合いそうなので、近いうちに軽くお茶でもどうですか？',
  'メッセージだと伝えきれないので、一度お電話でお話ししてみませんか？',
  '美味しそうですね！今度近くに行くときに寄ってみたいです。',
  'もしよければ、今度もっと詳しくお話聞かせてくれませんか？',

  // --- 追加分：丁寧なクローズ（忙しい時） ---
  '今ちょっとバタバタしているので、落ち着いたらゆっくり返信しますね！',
  '面白いお話ありがとうございます！後ほどじっくり読ませてもらいます。'
];

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
