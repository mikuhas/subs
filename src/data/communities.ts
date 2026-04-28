import { Community } from '../types/community'

export const mockCommunities: Community[] = [
  { id: 1,  name: 'カフェ部',          tag: 'カフェ・グルメ', description: '都内のカフェを一緒に巡ろう！おすすめ情報を共有しましょう。',         emoji: '☕', memberCount: 342 },
  { id: 2,  name: '音楽好き集まれ',     tag: '音楽',         description: 'ライブ・コンサート情報を共有。一緒に行く仲間を見つけよう。',           emoji: '🎵', memberCount: 218 },
  { id: 3,  name: '旅行仲間',          tag: '旅行',         description: '国内外の旅行好き集まれ！旅の計画を一緒に立てよう。',                   emoji: '✈️', memberCount: 456 },
  { id: 4,  name: 'アウトドア部',       tag: 'アウトドア',   description: 'ハイキング・キャンプが好きな人で集まろう。',                           emoji: '🏕️', memberCount: 183 },
  { id: 5,  name: 'グルメ探検隊',       tag: 'カフェ・グルメ', description: '東京の美味しいお店を一緒に探索しよう。',                           emoji: '🍜', memberCount: 521 },
  { id: 6,  name: '読書 Salon',         tag: '読書',         description: '本の感想を語り合ったり、読書会を開こう。',                           emoji: '📚', memberCount: 167 },
  { id: 7,  name: 'スポーツ好き',       tag: 'スポーツ',     description: '一緒に運動したり、スポーツ観戦を楽しもう。',                           emoji: '⚽', memberCount: 294 },
  { id: 8,  name: 'アニメ・ゲーム',     tag: 'アニメ・ゲーム', description: '推し活・ゲームの話で盛り上がろう！',                               emoji: '🎮', memberCount: 389 },
  { id: 9,  name: '映画部',            tag: '映画',         description: '映画好きで集まって感想戦をしよう。試写会情報も共有！',                   emoji: '🎬', memberCount: 276 },
  { id: 10, name: '料理好き',          tag: '料理',         description: 'レシピを共有したり、一緒に料理しよう。食の探求仲間を募集。',             emoji: '🍳', memberCount: 203 },
  { id: 11, name: 'アート・写真部',     tag: 'アート・写真', description: '作品を見せ合ったり、一緒に美術館・展覧会へ行こう。',                   emoji: '📷', memberCount: 148 },
  { id: 12, name: 'ファッション部',     tag: 'ファッション', description: 'コーデを語ったり、一緒にショッピングを楽しおう。',                     emoji: '👗', memberCount: 312 },
  { id: 13, name: 'ビジネス交流会',     tag: 'ビジネス',     description: 'スタートアップ・副業・キャリアアップを語り合おう。',                   emoji: '💼', memberCount: 195 },
  { id: 14, name: 'ペット好き',        tag: 'ペット',       description: 'ペットの話や一緒にお散歩・ドッグランへ行こう。',                       emoji: '🐶', memberCount: 267 },
  { id: 15, name: 'クリエイター集会',   tag: 'クリエイター', description: 'デザイン・動画・イラストを語り合う仲間募集！',                       emoji: '🎨', memberCount: 221 },
  { id: 16, name: 'ヨガ・フィットネス', tag: 'スポーツ',     description: '一緒に体を動かそう。ジムやヨガスタジオの情報を交換。',                 emoji: '🧘', memberCount: 178 },
  { id: 17, name: '山手線コミュニティ', tag: '沿線仲間',     description: '山手線沿線に住む・通う人のコミュニティ。地元情報を共有。',             emoji: '🚃', memberCount: 634 },
  { id: 18, name: '中央線沿線',         tag: '沿線仲間',     description: '中央線ユーザーの集まり。沿線のおすすめスポットを共有。',               emoji: '🚇', memberCount: 489 },
]

export const ALL_TAGS = [...new Set(mockCommunities.map(c => c.tag))]