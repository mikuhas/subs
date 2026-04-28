import { useEffect } from 'react'
import { User } from '../../types/user'

interface MatchPopupProps {
  user: User
  onClose: () => void
}

export const MatchPopup = ({ user, onClose }: MatchPopupProps) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="match-popup-overlay" onClick={onClose}>
      <div className="match-popup">
        <div className="match-popup-hearts">💞</div>
        <p className="match-popup-label">マッチング！</p>
        <img src={user.image} alt={user.name} className="match-popup-avatar" />
        <p className="match-popup-name">{user.name}さんとマッチしました</p>
      </div>
    </div>
  )
}
