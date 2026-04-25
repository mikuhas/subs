import { useState } from 'react'
import { User } from '../types/user'
import { getRandomUserByAge } from '../utils/userService'

export const useMatchingApp = () => {
  const [myAge, setMyAge] = useState<number | ''>('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [likedUsers, setLikedUsers] = useState<User[]>([])
  const [skippedUsers, setSkippedUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'liked' | 'skipped'| 'mypage'>('search')

  const findRandomUser = () => {
    if (myAge === '' || myAge === 0) {
      alert('年齢を入力してください')
      return
    }

    // 既にいいね/スキップしたユーザーのIDを合わせる
    const excludeIds = [...likedUsers.map(u => u.id), ...skippedUsers.map(u => u.id)]
    const user = getRandomUserByAge(myAge as number, excludeIds)

    if (!user) {
      alert('条件に合致する相手が見つかりませんでした')
      setCurrentUser(null)
      return
    }

    setCurrentUser(user)
  }

  const handleLike = () => {
    if (currentUser && !likedUsers.find(u => u.id === currentUser.id)) {
      setLikedUsers([...likedUsers, currentUser])
      setSkippedUsers(skippedUsers.filter(u => u.id !== currentUser.id))
      setCurrentUser(null)
    }
  }

  const handleSkip = () => {
    if (currentUser && !skippedUsers.find(u => u.id === currentUser.id)) {
      setSkippedUsers([...skippedUsers, currentUser])
      setLikedUsers(likedUsers.filter(u => u.id !== currentUser.id))
      setCurrentUser(null)
    }
  }

  const removeLiked = (id: number) => {
    setLikedUsers(likedUsers.filter(u => u.id !== id))
  }

  const removeSkipped = (id: number) => {
    setSkippedUsers(skippedUsers.filter(u => u.id !== id))
  }

  return {
    myAge,
    setMyAge,
    currentUser,
    likedUsers,
    skippedUsers,
    activeTab,
    setActiveTab,
    findRandomUser,
    handleLike,
    handleSkip,
    removeLiked,
    removeSkipped,
  }
}
