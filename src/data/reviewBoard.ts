export type BoardPost = {
  id: number
  type: 'good' | 'warning'
  content: string
  helpful: number
  agree: number
}

export const mockBoardPosts: BoardPost[] = [
  {
    id: 1, type: 'good',
    content: '初めてのデートで行き先を全部リサーチしてくれていて、すごく楽しかったです。帰り道も駅まで送ってくれて紳士的でした。',
    helpful: 24, agree: 18,
  },
  {
    id: 2, type: 'good',
    content: 'メッセージの返信がいつも丁寧で、こちらの話をちゃんと聞いてくれる方でした。会ってみても写真通りで安心できました。',
    helpful: 31, agree: 22,
  },
  {
    id: 3, type: 'good',
    content: 'お店のキャンセルが急に必要になったとき、すぐに代替案を出してくれて頼もしかったです。',
    helpful: 15, agree: 9,
  },
  {
    id: 4, type: 'warning',
    content: '待ち合わせに20分以上遅れてきて謝罪もなし。事前の連絡もありませんでした（運営確認済み）。',
    helpful: 42, agree: 38,
  },
  {
    id: 5, type: 'warning',
    content: 'プロフィール写真と実物がかなり異なる方がいました。写真は数年前のものだったようです。事前に確認することをお勧めします（運営確認済み）。',
    helpful: 35, agree: 29,
  },
]
