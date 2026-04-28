export function getDistanceLabel(km: number): string {
  if (km < 1) return '📍 すぐ近く'
  if (km < 5) return '🚶 徒歩・自転車圏内'
  if (km < 10) return '🚃 電車で数駅'
  if (km < 30) return '🗺 同じ市内'
  return '✈ 少し遠め'
}
