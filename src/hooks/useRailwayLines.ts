import { useState, useEffect } from 'react'

interface HeartRailsResponse {
  response: {
    line?: string[]
    error?: string
  }
}

const FALLBACK_LINES = [
  'JR山手線', 'JR中央線', 'JR総武線', 'JR京浜東北線', 'JR埼京線',
  'JR東海道線', 'JR横浜線', 'JR南武線', 'JR武蔵野線',
  '東急東横線', '東急田園都市線', '東急目黒線', '東急大井町線',
  '小田急小田原線', '京王線', '京王井の頭線',
  '西武新宿線', '西武池袋線',
  '東武東上線', '東武スカイツリーライン',
  '東京メトロ丸ノ内線', '東京メトロ銀座線', '東京メトロ日比谷線',
  '東京メトロ東西線', '東京メトロ千代田線', '東京メトロ有楽町線',
  '東京メトロ半蔵門線', '東京メトロ副都心線', '東京メトロ南北線',
  '都営浅草線', '都営新宿線', '都営三田線', '都営大江戸線',
  '京急本線', '相鉄本線', 'つくばエクスプレス',
]

export const useRailwayLines = () => {
  const [lines, setLines] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await fetch(
          'https://express.heartrails.com/api/json?method=getLines&prefecture=東京都'
        )
        if (!res.ok) throw new Error('fetch failed')
        const data: HeartRailsResponse = await res.json()
        if (data.response.line && data.response.line.length > 0) {
          setLines(data.response.line)
        } else {
          throw new Error('no lines')
        }
      } catch {
        setError(true)
        setLines(FALLBACK_LINES)
      } finally {
        setLoading(false)
      }
    }

    fetchLines()
  }, [])

  return { lines, loading, error }
}
