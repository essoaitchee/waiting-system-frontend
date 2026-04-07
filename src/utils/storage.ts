import { LOCAL_STORAGE_QUEUE_KEY } from '@/utils/constants'

export interface StoredQueueIdentity {
  eventId: string
  userId: string
  admissionToken?: string | null
}

export function readStoredQueueIdentity(): StoredQueueIdentity | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(LOCAL_STORAGE_QUEUE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as StoredQueueIdentity
  } catch {
    return null
  }
}

export function writeStoredQueueIdentity(identity: StoredQueueIdentity) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LOCAL_STORAGE_QUEUE_KEY, JSON.stringify(identity))
}

export function clearStoredQueueIdentity() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(LOCAL_STORAGE_QUEUE_KEY)
}
