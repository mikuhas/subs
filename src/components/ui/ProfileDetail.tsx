import { User } from '../types/user'

interface ProfileDetailProps {
  user: User
  onBack: () => void
}

export const ProfileDetail = ({ user, onBack }: ProfileDetailProps) => {
  return (
    <div className="profile-detail-modal">
      <div className="profile-detail-container">
        <button className="close-button" onClick={onBack}>×</button>
        
        <div className="profile-detail-image">
          <img src={user.image} alt={user.name} />
        </div>
        
        <div className="profile-detail-info">
          <h2>{user.name}</h2>
          <p className="detail-age">{user.age}歳</p>
          
          <div className="detail-section">
            <h3>自己紹介</h3>
            <p className="detail-bio">{user.bio}</p>
          </div>
          
          <div className="detail-section">
            <h3>その他の情報</h3>
            <ul className="detail-list">
              <li><strong>住んでいる場所：</strong> 東京都</li>
              <li><strong>職業：</strong> デザイナー</li>
              <li><strong>趣味：</strong> {user.bio}</li>
              <li><strong>休日の過ごし方：</strong> カフェでのんびり過ごす</li>
              <li><strong>理想のデート：</strong> 映画鑑賞とディナー</li>
            </ul>
          </div>
          
          <button className="back-button" onClick={onBack}>戻る</button>
        </div>
      </div>
    </div>
  )
}
