export type QueueStatusCode = 'WAITING' | 'ADMITTED' | 'ENTERED' | 'EXPIRED' | 'FAILED' | 'UNKNOWN'

export interface QueueIdentityRequest {
  eventId: number
  userId: string
}

export interface QueueConsumeRequest {
  eventId: number
  admissionToken: string
}

export interface QueueAdmissionRequest {
  eventId: number
  count?: number
}

export interface QueueAdmissionUser {
  userId: string
  queueToken: string | null
  admissionToken: string | null
  admissionExpiresAt: string | null
}

export interface QueueAdmissionResult {
  eventId: number | null
  requestedCount: number | null
  admittedCount: number | null
  admittedUsers: QueueAdmissionUser[]
}

export interface QueueStatusData {
  eventId: number | null
  userId: string
  status: QueueStatusCode
  queueToken: string | null
  queueNumber: number | null
  currentPosition: number | null
  aheadCount: number | null
  enteredAt: string | null
  admittedAt: string | null
  admissionToken: string | null
  admissionExpiresAt: string | null
  canEnter: boolean
  isExpired: boolean
}

export interface QueueConsumeResult {
  eventId: number | null
  userId: string
  status: QueueStatusCode
  processedAt: string | null
}
