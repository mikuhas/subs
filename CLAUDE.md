# SubS - マッチングアプリ設計ガイド

## デザインシステム

### カラーパレット
| 用途 | カラーコード |
|------|--------------|
| メインカラー | `#11C5C8` |
| サブカラー | `#FF6E5E` |
| テキストカラー | `#233A5A` |
| 背景カラー | `#F8FAFC` |

---

## ディレクトリ構成

```text
src/
├── components/
│   ├── pages/          # ページ単位のUI (auth, community, messages, mypage, fitcheck, userboard)
│   └── ui/             # 再利用可能なUIコンポーネント (Button, Card, Modal など)
├── composables/        # カスタムフック
├── contexts/           # React Context
├── data/               # モックデータ
├── types/              # TypeScript型定義
└── utils/              # ユーティリティ関数
```

---

## 命名規則

### コンポーネント
- PascalCase
- 例: `UserCard`, `MessageList`, `CommunityDetail`

### カスタムフック
- `useXxx` 形式
- 例: `useMatchingApp`, `useRailwayLines`

### ユーティリティ関数
- camelCase
- 例: `formatDate`, `calculateDistance`

### 型定義
- PascalCase
- 例: `User`, `Community`, `Message`

---

## Importルール

### 相対パス規則
```typescript
// 同一階層
import Button from './Button'

// 1階層上
import Card from '../Card'

// 2階層上
import Modal from '../../ui/Modal'
```

---

## 主要型定義

### User 型

```typescript
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
```

### フィールド説明
| フィールド | 型 | 説明 |
|------------|----|------|
| `id` | `number` | ユーザーID |
| `name` | `string` | 表示名 |
| `age` | `number` | 年齢 |
| `bio` | `string` | 自己紹介 |
| `image` | `string` | メイン画像URL |
| `subImages` | `string[]` | サブ画像一覧 |
| `line` | `string` | 利用路線 |
| `communityIds` | `number[]` | 所属コミュニティID |
| `distanceKm` | `number` | 距離 (km) |

---

## Context設計

### AuthContext
認証状態の管理を担当。

**責務:**
- ログイン状態管理
- ユーザー情報保持
- 認証チェック

---

### MessageContext
メッセージ機能を管理。

**責務:**
- チャット一覧管理
- メッセージ送受信
- 未読管理

---

### CommunityContext
コミュニティ情報を管理。

**責務:**
- コミュニティ一覧
- 参加状態管理
- コミュニティ検索

---

### ReviewContext
レビュー・評価関連を管理。

**責務:**
- レビュー投稿
- 評価取得
- レビュー表示

---

## カスタムフック一覧

### useMatchingApp
マッチングアプリのコア機能を提供。

**責務:**
- ユーザー検索
- いいね処理
- スキップ処理
- マッチ判定

---

### useRailwayLines
路線情報を取得・管理。

**責務:**
- 路線データ取得
- 路線フィルタ
- 駅情報取得

---

## 設計方針

### コンポーネント設計
- UIコンポーネントは責務を分離
- ページコンポーネントは画面単位で構成
- 状態管理は Context または Hook に集約

### 型設計
- `types/` に型定義を集約
- 再利用可能な型を優先
- APIレスポンス型とUI型を分離

### データ管理
- `data/` はモックデータ専用
- 実データ取得は `composables/` に責務を集約
- UI層ではデータ加工を最小化

### 保守性向上のポイント
- コンポーネント粒度を小さく保つ
- 共通処理は `utils/` または Hook に切り出す
- Context は責務ごとに分割
- import階層が深くなりすぎないよう構成を見直す

