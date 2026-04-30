export interface UserImage {
  id: number
  imageUrl: string
  position: number
}

export interface Profile {
  id: number
  name: string
  age: number
  bio: string
  email: string
  image: string
  gender?: 'mens' | 'womens' | 'kids'
  preferredLine?: string
  preferredMeetingArea?: string
  height?: number
  bodyType?: string
  randomMatchEnabled?: boolean
  frequentStation?: string
  firstDateStation?: string
  userImages?: UserImage[]
}
