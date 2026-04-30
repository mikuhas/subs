type ErrorHandler = (message: string) => void
let handler: ErrorHandler | null = null

export const errorEmitter = {
  setHandler: (h: ErrorHandler) => { handler = h },
  emit: (message: string) => { handler?.(message) },
}
