import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { Message } from '../types/message'

// conversations/{uid_a}_{uid_b}/messages/{auto-id}
// uid_a < uid_b で固定
const convId = (uid1: number, uid2: number): string => {
  const [a, b] = uid1 < uid2 ? [uid1, uid2] : [uid2, uid1]
  return `${a}_${b}`
}

export const sendFirestoreMessage = (
  myId: number,
  partnerId: number,
  text: string,
): Promise<void> =>
  addDoc(
    collection(db, 'conversations', convId(myId, partnerId), 'messages'),
    { senderId: myId, text, createdAt: serverTimestamp() },
  ).then(() => undefined)

export const subscribeToMessages = (
  myId: number,
  partnerId: number,
  onMessages: (msgs: Message[]) => void,
): (() => void) => {
  const q = query(
    collection(db, 'conversations', convId(myId, partnerId), 'messages'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, snapshot => {
    const msgs: Message[] = snapshot.docs.map(doc => {
      const d = doc.data()
      const ts = d.createdAt as Timestamp | null
      return {
        id: doc.id,
        text: d.text as string,
        fromMe: (d.senderId as number) === myId,
        timestamp: ts ? ts.toMillis() : Date.now(),
      }
    })
    onMessages(msgs)
  })
}
