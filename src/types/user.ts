export interface User {
  id: number
  name: string
  age: number
  bio: string
  image: string
  subImages?: string[]
  line: string
  communityIds: number[]
  distanceKm: number
}
