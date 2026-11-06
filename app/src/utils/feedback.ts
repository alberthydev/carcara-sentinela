export type FeedbackKind = 'success' | 'error' | 'info'

export interface FeedbackMessage {
  id: number
  kind: FeedbackKind
  text: string
}

let nextId = 0
const listeners = new Set<(message: FeedbackMessage) => void>()

export const notify = (text: string, kind: FeedbackKind = 'info') => {
  const message = { id: ++nextId, kind, text }
  listeners.forEach((listener) => listener(message))
}

export const onFeedback = (listener: (message: FeedbackMessage) => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
