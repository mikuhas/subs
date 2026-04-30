import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMutation, useLazyQuery } from '@apollo/client'
import { Profile } from '../types/profile'
import { SIGN_IN, ME } from '../lib/graphql/operations'

interface AuthContextType {
  isLoggedIn: boolean
  profile: Profile | null
  login: (email: string, password: string) => Promise<{ success: boolean; errors: string[] }>
  logout: () => void
  updateProfile: (profile: Profile) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const mapUserToProfile = (user: {
  name: string; age: number; bio?: string | null; imageUrl?: string | null
  gender?: string | null; preferredLine?: string | null; preferredMeetingArea?: string | null
  height?: number | null; bodyType?: string | null; randomMatchEnabled?: boolean
  frequentStation?: string | null; firstDateStation?: string | null
}, email: string): Profile => ({
  name: user.name,
  age: user.age,
  bio: user.bio ?? '',
  email,
  image: user.imageUrl ?? '',
  gender: user.gender as Profile['gender'],
  preferredLine: user.preferredLine ?? undefined,
  preferredMeetingArea: user.preferredMeetingArea ?? undefined,
  height: user.height ?? undefined,
  bodyType: user.bodyType ?? undefined,
  randomMatchEnabled: user.randomMatchEnabled ?? true,
  frequentStation: user.frequentStation ?? undefined,
  firstDateStation: user.firstDateStation ?? undefined,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  const [signIn] = useMutation(SIGN_IN)
  const [fetchMe] = useLazyQuery(ME)

  // ページリロード時にトークンからセッションを復元
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const email = localStorage.getItem('auth_email')
    if (!token || !email) return

    fetchMe().then(({ data }) => {
      if (data?.me) {
        setProfile(mapUserToProfile(data.me, email))
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_email')
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    let data: Awaited<ReturnType<typeof signIn>>['data']
    try {
      const res = await signIn({ variables: { email, password } })
      data = res.data
    } catch {
      return { success: false, errors: ['通信エラーが発生しました'] }
    }
    const result = data?.signIn
    if (!result) return { success: false, errors: ['通信エラーが発生しました'] }
    if (result.errors.length > 0) return { success: false, errors: result.errors }

    localStorage.setItem('auth_token', result.token)
    localStorage.setItem('auth_email', email)
    setProfile(mapUserToProfile(result.user, email))
    setIsLoggedIn(true)
    return { success: true, errors: [] }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_email')
    setIsLoggedIn(false)
    setProfile(null)
  }

  const updateProfile = (newProfile: Profile) => setProfile(newProfile)

  return (
    <AuthContext.Provider value={{ isLoggedIn, profile, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
