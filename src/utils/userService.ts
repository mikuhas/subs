import { User } from '../types/user'
import { mockUsers } from '../data/users'

export const getCompletelyRandomUser = (
  profileAge: number,
  excludeIds: number[] = [],
): User | null => {
  const pool = mockUsers.filter(
    u => !excludeIds.includes(u.id) && Math.abs(u.age - profileAge) <= 3,
  )
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * 年齢±10歳でフィルタリングしたランダムユーザーを取得
 * @param myAge ユーザー自身の年齢
 * @param excludeIds 除外するユーザーID（いいね/スキップ済みのユーザー）
 */
export const getRandomUserByAge = (
  myAge: number,
  excludeIds: number[] = [],
  line?: string,
  communityId?: number,
): User | null => {
  if (myAge === 0) return null

  const minAge = myAge - 10
  const maxAge = myAge + 10

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.age >= minAge &&
      user.age <= maxAge &&
      !excludeIds.includes(user.id) &&
      (!line || user.line === line) &&
      (!communityId || user.communityIds.includes(communityId))
  )

  if (filteredUsers.length === 0) return null

  const randomIndex = Math.floor(Math.random() * filteredUsers.length)
  return filteredUsers[randomIndex]
}
