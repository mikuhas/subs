interface MyPageProps {
  likedCount: number
  skippedCount: number
}

export const MyPage = ({ likedCount, skippedCount }: MyPageProps) => {
  return (
    <div className="mypage-container">
      <h2>マイページ</h2>
      
      <div className="mypage-profile">
        <div className="mypage-avatar">
          <img src="https://randomuser.me/api/portraits/women/50.jpg" alt="マイプロフィール" />
        </div>
        <div className="mypage-info">
          <h3>あなたのプロフィール</h3>
          <div className="mypage-field">
            <label>名前</label>
            <input type="text" placeholder="山田太郎" disabled />
          </div>
          <div className="mypage-field">
            <label>年齢</label>
            <input type="number" placeholder="30" disabled />
          </div>
          <div className="mypage-field">
            <label>自己紹介</label>
            <textarea placeholder="こんにちは！" disabled />
          </div>
        </div>
      </div>

      <div className="mypage-stats">
        <h3>マッチング統計</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{likedCount}</div>
            <div className="stat-label">いいねされた数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{skippedCount}</div>
            <div className="stat-label">スキップ数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{Math.round((likedCount / (likedCount + skippedCount)) * 100) || 0}%</div>
            <div className="stat-label">マッチ率</div>
          </div>
        </div>
      </div>

      <div className="mypage-settings">
        <h3>設定</h3>
        <button className="settings-button">プロフィールを編集</button>
        <button className="settings-button">プライバシー設定</button>
        <button className="settings-button danger">ログアウト</button>
      </div>
    </div>
  )
}
