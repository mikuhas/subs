import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMutation, useLazyQuery } from '@apollo/client'
import { Profile } from '../types/profile'
import { SIGN_IN, SIGN_UP, ME, UPDATE_PROFILE } from '../lib/graphql/operations'

interface AuthContextType {
  isLoggedIn: boolean
  initializing: boolean
  profile: Profile | null
  login: (email: string, password: string) => Promise<{ success: boolean; errors: string[] }>
  register: (email: string, password: string, name: string, age: number, gender: 'mens' | 'womens') => Promise<{ success: boolean; errors: string[] }>
  logout: () => void
  updateProfile: (profile: Profile) => Promise<{ success: boolean; errors: string[] }>
}

const AuthContext = createContext<AuthContextType | null>(null)

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

const mapUserToProfile = (user: {
  id: string; name: string; age: number; bio?: string | null; imageUrl?: string | null
  gender: string; preferredLine?: string | null; preferredMeetingArea?: string | null
  height?: number | null; bodyType?: string | null; randomMatchEnabled?: boolean
  frequentStation?: string | null; firstDateStation?: string | null
  userImages?: { id: string; imageUrl: string; position: number }[] | null
}, email: string): Profile => ({
  id: parseInt(user.id),
  name: user.name,
  age: user.age,
  bio: user.bio ?? '',
  email,
  image: user.imageUrl ?? '',
  gender: user.gender as 'mens' | 'womens',
  preferredLine: user.preferredLine ?? undefined,
  preferredMeetingArea: user.preferredMeetingArea ?? undefined,
  height: user.height ?? undefined,
  bodyType: user.bodyType ?? undefined,
  randomMatchEnabled: user.randomMatchEnabled ?? true,
  frequentStation: user.frequentStation ?? undefined,
  firstDateStation: user.firstDateStation ?? undefined,
  userImages: (user.userImages ?? []).map(img => ({
    id: parseInt(img.id),
    imageUrl: img.imageUrl,
    position: img.position,
  })),
})

const MOCK_PROFILE: Profile = {
  id: 1,
  name: 'テストユーザー',
  age: 25,
  bio: 'モック用のプロフィールです。',
  email: 'test@example.com',
  image: '',
  gender: 'mens',
  randomMatchEnabled: true,
  userImages: [],
}

const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  const login = async (_email: string, _password: string) => {
    setProfile(MOCK_PROFILE)
    setIsLoggedIn(true)
    return { success: true, errors: [] }
  }

  const register = async (_email: string, _password: string, name: string, age: number, gender: 'mens' | 'womens') => {
    setProfile({ ...MOCK_PROFILE, name, age, gender })
    setIsLoggedIn(true)
    return { success: true, errors: [] }
  }

  const logout = () => {
    setIsLoggedIn(false)
    setProfile(null)
  }

  const updateProfile = async (newProfile: Profile) => {
    setProfile(newProfile)
    return { success: true, errors: [] }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, initializing: false, profile, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

const RealAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [initializing, setInitializing] = useState(
    () => !!localStorage.getItem('auth_token'),
  )
  const [profile, setProfile] = useState<Profile | null>(null)

  const [signIn] = useMutation(SIGN_IN)
  const [signUp] = useMutation(SIGN_UP)
  const [updateProfileMutation] = useMutation(UPDATE_PROFILE)
  const [fetchMe] = useLazyQuery(ME)

  // ページリロード時にトークンからセッションを復元
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const email = localStorage.getItem('auth_email')
    if (!token || !email) {
      setInitializing(false)
      return
    }

    const minDelay = new Promise<void>(resolve => setTimeout(resolve, 1000))

    Promise.all([fetchMe(), minDelay]).then(([{ data }]) => {
      if (data?.me) {
        setProfile(mapUserToProfile(data.me, email))
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_email')
      }
      setInitializing(false)
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

  const register = async (email: string, password: string, name: string, age: number, gender: 'mens' | 'womens') => {
    let data: Awaited<ReturnType<typeof signUp>>['data']
    try {
      const res = await signUp({ variables: { email, password, name, age, gender } })
      data = res.data
    } catch {
      return { success: false, errors: ['通信エラーが発生しました'] }
    }
    const result = data?.signUp
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

  const updateProfile = async (newProfile: Profile): Promise<{ success: boolean; errors: string[] }> => {
    const email = localStorage.getItem('auth_email') ?? profile?.email ?? ''
    let data: Awaited<ReturnType<typeof updateProfileMutation>>['data']
    try {
      const res = await updateProfileMutation({
        variables: {
          name: newProfile.name,
          age: newProfile.age,
          bio: newProfile.bio,
          imageUrl: newProfile.image,
          gender: newProfile.gender,
          preferredLine: newProfile.preferredLine,
          preferredMeetingArea: newProfile.preferredMeetingArea,
          height: newProfile.height,
          bodyType: newProfile.bodyType,
          frequentStation: newProfile.frequentStation,
          firstDateStation: newProfile.firstDateStation,
          randomMatchEnabled: newProfile.randomMatchEnabled,
        },
      })
      data = res.data
    } catch {
      return { success: false, errors: ['通信エラーが発生しました'] }
    }
    const result = data?.updateProfile
    if (!result) return { success: false, errors: ['通信エラーが発生しました'] }
    if (result.errors.length > 0) return { success: false, errors: result.errors }

    setProfile(mapUserToProfile(result.user, email))
    return { success: true, errors: [] }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, initializing, profile, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const AuthProvider = isMock ? MockAuthProvider : RealAuthProvider

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
