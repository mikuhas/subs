# マッチングアプリ(SubS)

## 実装済み機能

### 認証機能
- ログイン画面 (LoginPage)
- ユーザー認証 (AuthContext)

### 検索機能
- ランダムユーザー表示 (年齢±10で絞り込み)
- 路線選択 (HeartRails API 連携)
- コミュニティタグ選択
- いいね/スキップ機能

### リスト管理
- いいねしたユーザー一覧
- スキップしたユーザー一覧
- ユーザー削除機能

### メッセージ機能
- メッセージページ (MessagesPage)
- 会話画面 (ConversationView)
- メッセージコンテキスト (MessageContext)

### コミュニティ機能
- コミュニティ一覧 (CommunityPage)
- コミュニティ詳細 (CommunityDetail)
- コミュニティコンテキスト (CommunityContext)

### マイページ
- プロフィール編集 (MyPage)
- いいね/スキップ統計表示

### UIコンポーネント
- TabNavigation: タブ切り替え
- SearchSection: 検索条件入力
- ProfileCard: ユーザーカード表示
- ProfileDetail: ユーザー詳細モーダル
- UserListTab: ユーザーリスト表示

## ディレクトリ構成 (Vite ベストプラクティス)

```
src/
├── assets/              # 静的アセット (画像、フォント)
├── components/
│   ├── layouts/         # レイアウトコンポーネント
│   ├── pages/           # ページコンポーネント
│   │   ├── auth/       # 認証ページ
│   │   ├── community/ # コミュニティページ
│   │   ├── messages/  # メッセージページ
│   │   └── mypage/     # マイページ
│   └── ui/             # UIコンポーネント (Button, Card, Modal等)
├── composables/        # カスタムフック (useXxx 形式)
├── contexts/           # React Context
├── data/               # 静的データ (mockデータ)
├── types/              # TypeScript 型定義
└── utils/              # ユーティリティ関数
```

### 命名規則
- コンポーネント: PascalCase (例: `ProfileCard.tsx`)
- フック/コンポーザブル: camelCase + use prefix (例: `useMatchingApp.ts`)
- ユーティリティ: camelCase (例: `userService.ts`)
- 型: PascalCase (例: `User.ts`)

### import パス規則
- 同じディレクトリ: `./componentName`
- 1階層上: `../componentName`
- 2階層上: `../../componentName`
- 3階層上: `../../../componentName`