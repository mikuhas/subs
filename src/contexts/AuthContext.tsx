import { createContext, useContext, useState, ReactNode } from 'react'
import { Profile } from '../types/profile'
import my_profile from '../assets/profile/my_profile.png'

interface AuthContextType {
  isLoggedIn: boolean
  profile: Profile | null
  login: (email: string, password: string) => boolean
  logout: () => void
  updateProfile: (profile: Profile) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  const login = (email: string, password: string): boolean => {
    if (!email.trim() || !password.trim()) return false
    setProfile({
      name: '山田太郎',
      age: 30,
      bio: 'よろしくお願いします！',
      email,
      image: my_profile,
      gender: 'mens',
    })
    setIsLoggedIn(true)
    return true
  }

  const logout = () => {
    setIsLoggedIn(false)
    setProfile(null)
  }

  const updateProfile = (newProfile: Profile) => {
    setProfile(newProfile)
  }

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
