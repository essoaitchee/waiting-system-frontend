import type {
  QueueAdmissionApiResponse,
  QueueConsumeApiResponse,
  QueueEnterApiResponse,
  QueueStatusApiResponse,
} from '@/types/api'
import type { QueueAdmissionResult, QueueConsumeResult, QueueStatusCode, QueueStatusData } from '@/types/queue'
import { pickNumber, pickString, toArray, unwrapPayload } from '@/api/mappers/shared'

function normalizeQueueStatus(value: string | null): QueueStatusCode {
  const normalized = value?.toUpperCase()

  if (normalized === 'WAITING' || normalized === 'ADMITTED' || normalized === 'ENTERED' || normalized === 'EXPIRED') {
    return normalized
  }

  if (normalized === 'FAILED') {
    return 'FAILED'
  }

  return 'UNKNOWN'
}

function mapQueuePayload(source: QueueEnterApiResponse | QueueStatusApiResponse | Record<string, unknown>): QueueStatusData {
  // DTO 필드명이 달라지면 아래 후보 키 배열만 수정하면 됩니다.
  const status = normalizeQueueStatus(pickString(source, ['status', 'queueStatus', 'state']))
  const admissionToken = pickString(source, ['admissionToken', 'token'])

  return {
    eventId: pickNumber(source, ['eventId', 'queueEventId']),
    userId: pickString(source, ['userId', 'memberId']) ?? '',
    status,
    queueToken: pickString(source, ['queueToken']),
    queueNumber: pickNumber(source, ['queueNumber', 'queueSequence']),
    currentPosition: pickNumber(source, ['currentPosition', 'position', 'rank']),
    aheadCount: pickNumber(source, ['aheadCount', 'waitingAhead', 'ahead']),
    enteredAt: pickString(source, ['enteredAt', 'createdAt']),
    admittedAt: pickString(source, ['admittedAt']),
    admissionToken,
    admissionExpiresAt: pickString(source, ['admissionExpiresAt', 'expiresAt']),
    canEnter: status === 'ADMITTED' && Boolean(admissionToken),
    isExpired: status === 'EXPIRED',
  }
}

export function mapQueueEnterResponse(payload: unknown) {
  return mapQueuePayload(unwrapPayload(payload) as QueueEnterApiResponse)
}

export function mapQueueStatusResponse(payload: unknown) {
  return mapQueuePayload(unwrapPayload(payload) as QueueStatusApiResponse)
}

export function mapQueueConsumeResponse(payload: unknown): QueueConsumeResult {
  const source = unwrapPayload(payload) as QueueConsumeApiResponse

  return {
    eventId: pickNumber(source, ['eventId', 'queueEventId']),
    userId: pickString(source, ['userId', 'memberId']) ?? '',
    status: normalizeQueueStatus(pickString(source, ['status', 'queueStatus', 'state'])),
    processedAt: pickString(source, ['processedAt', 'updatedAt']),
  }
}

export function mapQueueAdmissionResponse(payload: unknown): QueueAdmissionResult {
  const source = unwrapPayload(payload) as QueueAdmissionApiResponse

  return {
    eventId: pickNumber(source, ['eventId', 'queueEventId']),
    requestedCount: pickNumber(source, ['requestedCount', 'count']),
    admittedCount: pickNumber(source, ['admittedCount']),
    admittedUsers: toArray(source.admittedUsers).map((item) => {
      const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}

      return {
        userId: pickString(record, ['userId', 'memberId']) ?? '',
        queueToken: pickString(record, ['queueToken']),
        admissionToken: pickString(record, ['admissionToken', 'token']),
        admissionExpiresAt: pickString(record, ['admissionExpiresAt', 'expiresAt']),
      }
    }),
  }
}
