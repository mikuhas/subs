import { User } from '../types/user'
import profile_1 from '../assets/profile/profile_1.png'
import profile_2 from '../assets/profile/profile_2.png'
import profile_3 from '../assets/profile/profile_3.png'
import profile_4 from '../assets/profile/profile_4.png'
import profile_5 from '../assets/profile/profile_5.png'

const MOCK_LINES = [
  'JR山手線', 'JR中央線', 'JR総武線', 'JR埼京線', 'JR京浜東北線',
  '東急東横線', '東急田園都市線', '小田急線', '京王線',
  '東京メトロ丸ノ内線', '東京メトロ銀座線', '東京メトロ半蔵門線',
  '東京メトロ副都心線', '都営大江戸線', '西武池袋線', '東武東上線',
]

const rawUsers: Omit<User, 'line' | 'communityIds' | 'distanceKm'>[] = [
  {
    id: 1, name: '田中花子', age: 25, image: profile_1,
    subImages: [profile_2, profile_3],
    bio: '音楽が大好きで、週末はよくライブや音楽フェスに行ってます🎵\nジャズからJ-POPまで、気分で幅広く聴くタイプです。\n\n普段はわりとのんびりしてるけど、\n好きなことになると急に熱くなります笑\n\n一緒においしいごはんを食べながら、\nゆっくり話せる方と出会えたら嬉しいです！',
  },
  {
    id: 2, name: '佐藤美咲', age: 23, image: profile_2,
    subImages: [profile_4, profile_5],
    bio: 'おいしいコーヒーとかわいいカフェを求めて\n週末は都内をふらふらしてます☕\n\nインスタに写真まとめてるので、\nおすすめのお店があればぜひ教えてください！\n\n笑いのツボが合う人が好きです。\n明るくて話しやすい方だと嬉しいな〜',
  },
  {
    id: 3, name: '鈴木由美', age: 27, image: profile_3,
    subImages: [profile_1, profile_4],
    bio: '2年前からヨガを始めて、今は週3回スタジオに通ってます🧘\nハイキングや朝ランも好きで、体を動かすのが日課になりました。\n\n仕事はWebデザイナーをしています。\n\n穏やかでていねいに接してくれる方に惹かれます。\n一緒に自然の中を歩けたら最高です！',
  },
  {
    id: 4, name: '山田恵子', age: 24, image: profile_4,
    subImages: [profile_2, profile_3],
    bio: '映画が大好きで、毎月10本以上は観てます🎬\n洋画・邦画・アニメ、気になったものは全部チェック派です。\n\n映画のあとにカフェでああだこうだ語り合うのが\nもう最高に幸せな時間で…笑\n\n読書も好きなので、おすすめ本があれば交換しましょう✨',
  },
  {
    id: 5, name: '伊藤麻衣', age: 26, image: profile_5,
    subImages: [profile_1, profile_3],
    bio: '旅行が大好きで、これまで15カ国以上を旅してきました🌏\n旅先で出会うごはん・文化・人がたまらなく好きです。\n\n普段はアパレルの仕事をしています。\n\nおおらかで一緒にいて楽な方が好みです。\n次は東南アジアを誰かと一緒に旅してみたいな〜！',
  },
]

export const mockUsers: User[] = rawUsers.map((u, i) => {
  const c1 = (i % 18) + 1
  const c2 = ((i * 3 + 5) % 18) + 1
  return {
    ...u,
    line: MOCK_LINES[i % MOCK_LINES.length],
    communityIds: c1 === c2 ? [c1] : [c1, c2],
    distanceKm: parseFloat(((u.id * 7 + 3) % 35 + 0.5).toFixed(1)),
  }
})