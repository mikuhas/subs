const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string

const resizeImage = (file: File, maxPx = 800): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Blob変換に失敗しました'))),
        'image/jpeg',
        0.75,
      )
    }
    img.onerror = reject
    img.src = objectUrl
  })

export const uploadProfileImage = async (file: File, token: string): Promise<string> => {
  const resized = await resizeImage(file)

  const form = new FormData()
  form.append('file', resized, file.name.replace(/\.[^.]+$/, '.jpg'))

  const res = await fetch(`${BACKEND_URL}/api/v1/upload_image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error ?? 'アップロードに失敗しました')
  }

  const data = await res.json() as { url: string }
  return data.url
}
