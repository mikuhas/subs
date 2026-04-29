export interface Profile {
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
}
