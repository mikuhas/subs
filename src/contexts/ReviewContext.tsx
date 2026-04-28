import { createContext, useContext, useState, ReactNode } from 'react'

export type SubmittedReview = {
  userId: number
  ratings: { sincerity: number; match: number; safety: number }
  tags: string[]
  comment: string
  timestamp: number
}

type ReviewContextType = {
  reviews: SubmittedReview[]
  addReview: (review: SubmittedReview) => void
  getReviewsForUser: (userId: number) => SubmittedReview[]
}

const ReviewContext = createContext<ReviewContextType | null>(null)

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<SubmittedReview[]>([])

  const addReview = (review: SubmittedReview) =>
    setReviews(prev => [...prev.filter(r => r.userId !== review.userId), review])

  const getReviewsForUser = (userId: number) =>
    reviews.filter(r => r.userId === userId)

  return (
    <ReviewContext.Provider value={{ reviews, addReview, getReviewsForUser }}>
      {children}
    </ReviewContext.Provider>
  )
}

export const useReview = () => {
  const ctx = useContext(ReviewContext)
  if (!ctx) throw new Error('useReview must be used within ReviewProvider')
  return ctx
}
