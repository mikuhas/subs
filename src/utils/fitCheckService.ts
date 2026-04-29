import Encoding from 'encoding-japanese'

const API_KEY = import.meta.env.VITE_NANO_BANANA_API_KEY as string

export type FitCheckResult = {
  imageBase64: string | null
  text: string
}

export type ProfileInfo = {
  height?: number
  bodyType?: string
  preferredColors?: string[]
  budget?: string
  gender?: 'mens' | 'womens' | 'kids'
}

const AVERAGE_HEIGHT: Record<string, number> = { mens: 171, womens: 158, kids: 140 }

function estimateSize(height?: number, bodyType?: string, gender?: ProfileInfo['gender']): string {
  const bulky = bodyType === 'がっちり' || bodyType === '筋肉質'
  const h = height ?? AVERAGE_HEIGHT[gender ?? 'mens']
  if (h <= 155) return bulky ? 'M' : 'S'
  if (h <= 165) return bulky ? 'L' : 'M'
  if (h <= 175) return bulky ? 'XL' : 'L'
  return bulky ? 'XXL' : 'XL'
}

const GENDER_CODE: Record<string, string> = { mens: 'men', womens: 'women', kids: 'kids' }

// ユニクロ・GU 共通カラーコード（キーワード先頭の色名と照合）
const COLOR_CODE: [string, string][] = [
  ['ホワイト', 'COL00'], ['白', 'COL00'], ['オフホワイト', 'COL01'],
  ['ライトグレー', 'COL02'], ['グレー', 'COL03'], ['ダークグレー', 'COL07'],
  ['ブラック', 'COL09'], ['黒', 'COL09'],
  ['レッド', 'COL10'], ['赤', 'COL10'], ['ピンク', 'COL15'], ['ワイン', 'COL19'],
  ['オレンジ', 'COL20'], ['橙', 'COL20'],
  ['ベージュ', 'COL30'], ['ナチュラル', 'COL32'],
  ['ブラウン', 'COL35'], ['茶', 'COL35'],
  ['カーキ', 'COL55'], ['オリーブ', 'COL55'],
  ['イエロー', 'COL40'], ['黄', 'COL40'],
  ['グリーン', 'COL50'], ['緑', 'COL50'],
  ['ブルー', 'COL60'], ['青', 'COL60'], ['ライトブルー', 'COL62'],
  ['ネイビー', 'COL69'], ['紺', 'COL69'],
  ['パープル', 'COL70'], ['紫', 'COL70'],
]

// ユニクロ・GU 共通サイズID
const SIZE_ID: Record<string, string> = {
  'XS': 'SMA001', 'S': 'SMA002', 'M': 'SMA003',
  'L': 'SMA004', 'XL': 'SMA005', 'XXL': 'SMA006', '3XL': 'SMA007',
}

function extractColorCode(keyword: string): string | undefined {
  for (const [name, code] of COLOR_CODE) {
    if (keyword.startsWith(name)) return code
  }
  return undefined
}

type PriceRange = { min?: number; max?: number }
type BudgetDist = { zozo: PriceRange; uniqlo: PriceRange; gu: PriceRange; prompt: string }

const BUDGET_DIST: Record<string, BudgetDist> = {
  '5,000〜10,000円': {
    zozo:   { min: 3000, max: 5000 },
    uniqlo: { min: 2000, max: 4000 },
    gu:     { min: 1000, max: 2500 },
    prompt: '合計予算5,000〜10,000円（ZOZO: 3,000〜5,000円/点、ユニクロ: 2,000〜4,000円/点、GU: 1,000〜2,500円/点）',
  },
  '10,000〜20,000円': {
    zozo:   { min: 5000, max: 10000 },
    uniqlo: { min: 3000, max: 6000 },
    gu:     { min: 2000, max: 4000 },
    prompt: '合計予算10,000〜20,000円（ZOZO: 5,000〜10,000円/点、ユニクロ: 3,000〜6,000円/点、GU: 2,000〜4,000円/点）',
  },
  '20,000円〜': {
    zozo:   { min: 10000 },
    uniqlo: { min: 5000, max: 10000 },
    gu:     { min: 3000, max: 5000 },
    prompt: '合計予算20,000円以上（ZOZO: 10,000円以上/点、ユニクロ: 5,000〜10,000円/点、GU: 3,000〜5,000円/点）',
  },
}

// ZOZO は CP932 (Shift-JIS) エンコーディング、ASCII printable はそのまま残す
function encodeShiftJIS(str: string): string {
  const sjis = Encoding.convert(Encoding.stringToCode(str), { to: 'SJIS', from: 'UNICODE' })
  return (sjis as number[]).map(b => {
    if (b >= 0x21 && b <= 0x7e && b !== 0x25) return String.fromCharCode(b)
    return `%${b.toString(16).toUpperCase().padStart(2, '0')}`
  }).join('')
}

function buildZozoUrl(keyword: string, gender?: ProfileInfo['gender'], budget?: string): string {
  const sex = gender ? GENDER_CODE[gender] : ''
  let url = `https://zozo.jp/search/?sex=${sex}&p_keyv=${encodeShiftJIS(keyword.trim())}&p_gtype=1`
  const price = budget ? BUDGET_DIST[budget]?.zozo : undefined
  if (price?.min) url += `&p_pmin=${price.min}`
  if (price?.max) url += `&p_pmax=${price.max}`
  return url
}

function buildUniqloUrl(keyword: string, size: string, gender?: ProfileInfo['gender'], budget?: string): string {
  const kw = keyword.trim()
  let url = `https://www.uniqlo.com/jp/ja/search?q=${encodeURIComponent(`${kw} ${size}`.trim())}`
  if (gender && GENDER_CODE[gender]) url += `&gender=${GENDER_CODE[gender]}`
  const colorCode = extractColorCode(kw)
  if (colorCode) url += `&color=${colorCode}`
  const sizeId = SIZE_ID[size]
  if (sizeId) url += `&size=${sizeId}`
  const price = budget ? BUDGET_DIST[budget]?.uniqlo : undefined
  if (price?.min) url += `&price_min=${price.min}`
  if (price?.max) url += `&price_max=${price.max}`
  return url
}

function buildGuUrl(keyword: string, size: string, gender?: ProfileInfo['gender'], budget?: string): string {
  const kw = keyword.trim()
  let url = `https://www.gu-global.com/jp/ja/search/?q=${encodeURIComponent(`${kw} ${size}`.trim())}`
  if (gender && GENDER_CODE[gender]) url += `&gender=${GENDER_CODE[gender]}`
  const colorCode = extractColorCode(kw)
  if (colorCode) url += `&color=${colorCode}`
  const sizeId = SIZE_ID[size]
  if (sizeId) url += `&size=${sizeId}`
  const price = budget ? BUDGET_DIST[budget]?.gu : undefined
  if (price?.min) url += `&price_min=${price.min}`
  if (price?.max) url += `&price_max=${price.max}`
  return url
}

function buildSearchUrl(
  site: 'zozo' | 'uniqlo' | 'gu',
  keyword: string,
  size: string,
  gender?: ProfileInfo['gender'],
  budget?: string,
): string {
  if (site === 'zozo') return buildZozoUrl(keyword, gender, budget)
  if (site === 'uniqlo') return buildUniqloUrl(keyword, size, gender, budget)
  return buildGuUrl(keyword, size, gender, budget)
}

// Geminiが出力した zozo://キーワード 形式を実URLに変換する
function resolveSearchLinks(text: string, size: string, gender?: ProfileInfo['gender'], budget?: string): string {
  return text
    .replace(/\(zozo:\/\/([^)]+)\)/g, (_, kw) => `(${buildSearchUrl('zozo', kw, size, gender, budget)})`)
    .replace(/\(uniqlo:\/\/([^)]+)\)/g, (_, kw) => `(${buildSearchUrl('uniqlo', kw, size)})`)
    .replace(/\(gu:\/\/([^)]+)\)/g, (_, kw) => `(${buildSearchUrl('gu', kw, size)})`)
}

export async function fetchFitCheck(
  userImageBase64: string,
  stylePrompt: string,
  profileInfo: ProfileInfo = {},
): Promise<FitCheckResult> {
  const size = estimateSize(profileInfo.height, profileInfo.bodyType, profileInfo.gender)
  const MODEL = 'gemini-3.1-flash-lite-preview';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: `あなたはプロのファッションスタイリストです。デート用の服を選んでください。以下のMarkdownテンプレートを厳守して3パターン出力してください。テンプレート外の文章は一切出力しないでください。

【サイト特性】
- ZOZO: ブランド・セレクトショップ系。トレンド感のあるアイテムを提案。
- ユニクロ: 高品質なベーシックアイテム。シルエットや素材を重視した提案。
- GU: トレンドを押さえたリーズナブルなアイテム。コーデの差し色や旬のデザインを提案。

【リンク形式】必ず zozo:// uniqlo:// gu:// の後ろに「色 アイテム名」の日本語キーワードをエンコードなしで記述してください。

## 👗 パターン[番号]: [コーデ名]

### トップス
- **アイテム**: [各サイトの特性に合った具体的なアイテム名]
- **カラー**: [色]
- **概算価格**: ZOZO約[X,XXX]円 / ユニクロ約[X,XXX]円 / GU約[X,XXX]円
- [ZOZOで探す](zozo://[色 アイテム名]) / [ユニクロで探す](uniqlo://[色 アイテム名]) / [GUで探す](gu://[色 アイテム名])

### ボトムス
- **アイテム**: [各サイトの特性に合った具体的なアイテム名]
- **カラー**: [色]
- **概算価格**: ZOZO約[X,XXX]円 / ユニクロ約[X,XXX]円 / GU約[X,XXX]円
- [ZOZOで探す](zozo://[色 アイテム名]) / [ユニクロで探す](uniqlo://[色 アイテム名]) / [GUで探す](gu://[色 アイテム名])

### シューズ
- **アイテム**: [各サイトの特性に合った具体的なアイテム名]
- **カラー**: [色]
- **概算価格**: ZOZO約[X,XXX]円 / ユニクロ約[X,XXX]円 / GU約[X,XXX]円
- [ZOZOで探す](zozo://[色 アイテム名]) / [ユニクロで探す](uniqlo://[色 アイテム名]) / [GUで探す](gu://[色 アイテム名])

### 小物
- [アイテム名（色）]
- **概算価格**: 約[X,XXX]円
- [ZOZOで探す](zozo://[色 アイテム名]) / [ユニクロで探す](uniqlo://[色 アイテム名]) / [GUで探す](gu://[色 アイテム名])

### ポイント
[このコーデの魅力を1〜2文で説明]

---`,
          }],
        },
        contents: [
          {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: userImageBase64 } },
              {
                text: [
                  `写真の人物に似合う「${stylePrompt}」スタイルのコーデを3パターン提案してください。`,
                  profileInfo.height ? `身長: ${profileInfo.height}cm` : '',
                  profileInfo.bodyType ? `体型: ${profileInfo.bodyType}` : '',
                  profileInfo.preferredColors?.length ? `好みの色: ${profileInfo.preferredColors.join('・')}` : '',
                  profileInfo.budget ? BUDGET_DIST[profileInfo.budget]?.prompt ?? `予算: ${profileInfo.budget}` : '',
                ].filter(Boolean).join('\n'),
              },
            ],
          },
        ],
      }),
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json() as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }
  const parts = data.candidates?.[0]?.content?.parts ?? []

  const rawText = parts.find(p => p.text)?.text ?? ''
  return {
    imageBase64: null,
    text: resolveSearchLinks(rawText, size, profileInfo.gender, profileInfo.budget),
  }
}

function stripLinks(value: string): string {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
}

export function summarizeOutfitForPrompt(text: string, patternIndex = 0): string {
  const n = patternIndex + 1
  // 対象パターンのセクションだけ切り出す
  const re = new RegExp(`##[^\\n]*パターン${n}[\\s\\S]*?(?=\\n##[^\\n]*パターン${n + 1}|$)`)
  const section = text.match(re)?.[0] ?? text

  // ### セクションごとにアイテムとカラーをペアで取得し、ズレを防ぐ
  const pairs: string[] = []
  for (const [, body] of section.matchAll(/###\s+[^\n]+\n([\s\S]*?)(?=\n###|\n##|$)/g)) {
    const item = body.match(/\*\*アイテム\*\*[：:]\s*([^\n]+)/)?.[1]
    const color = body.match(/\*\*カラー\*\*[：:]\s*([^\n]+)/)?.[1]
    if (item) pairs.push(color ? `${stripLinks(color)}の${stripLinks(item)}` : stripLinks(item))
  }
  return pairs.join(', ').slice(0, 120)
}

const GENDER_PROMPT: Record<string, string> = {
  mens: 'single male model',
  womens: 'single female model',
  kids: 'single child model',
}

function extractPatternTitle(text: string, patternIndex: number): string {
  const n = patternIndex + 1
  const match = text.match(new RegExp(`##[^\\n]*パターン${n}[^:：\\n]*[:：]\\s*([^\\n]+)`))
  if (!match) return 'date outfit'
  // 絵文字・記号を除去して純粋なテキストだけ残す
  return match[1].replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim() || 'date outfit'
}

export function buildOutfitIllustrationUrl(
  outfitDescription: string,
  gender?: 'mens' | 'womens' | 'kids',
  patternIndex = 0,
  seed?: number,
): string {
  const summary = summarizeOutfitForPrompt(outfitDescription, patternIndex)
  const title = extractPatternTitle(outfitDescription, patternIndex)
  const genderText = (gender && GENDER_PROMPT[gender]) ?? 'single person'
  const prompt = `Fashion illustration, clean white background, front view, one person only, ${genderText} with Japanese appearance, full body head to toe, outfit theme: ${title}, stylish fashion sketch. Outfit: ${summary}`
  const s = seed ?? Math.floor(Math.random() * 99999)
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&nologo=true&seed=${s}`
}

const MAX_SIZE = 512
const JPEG_QUALITY = 0.5

function compressImage(source: HTMLImageElement | ImageBitmap): string {
  const w = 'width' in source ? source.width : source.width
  const h = 'height' in source ? source.height : source.height
  const scale = Math.min(1, MAX_SIZE / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source as CanvasImageSource, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      resolve(compressImage(img))
      URL.revokeObjectURL(url)
    }
    img.onerror = reject
    img.src = url
  })
}

export async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return fileToBase64(new File([blob], 'profile.jpg', { type: blob.type }))
}
