# SubS - マッチングアプリ

## カラー
- メイン: #11C5C8
- サブ: #FF6E5E
- 文字: #233A5A
- 背景: #F8FAFC

## 構成
```
src/
├── components/pages/   # ページ (auth, community, messages, mypage, fitcheck, userboard)
├── components/ui/      # UI (Button, Card, Modal等)
├── composables/        # useXxx フック
├── contexts/           # React Context (Auth, Message, Community, Review)
├── data/               # mockデータ
├── types/              # TypeScript型
└── utils/              # ユーティリティ
```

## 命名規則
- コンポーネント: PascalCase
- フック: useXxx
- ユーティリティ: camelCase
- 型: PascalCase

## import
- 同じ: `./name`
- 1階層上: `../name`
- 2階層上: `../../name`

## 主要型
```typescript
// user.ts
interface User {
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
```

## コンテキスト
- AuthContext: 認証状態管理
- MessageContext: メッセージ管理
- CommunityContext: コミュニティ管理
- ReviewContext: レビュ管理

## コンポーザブル
- useMatchingApp: マッチング機能 (検索、いいね、スキップ、一致)
- useRailwayLines: 路線データ取得

