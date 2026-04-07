import { apiClient } from '@/api/client'
import {
  mapQueueAdmissionResponse,
  mapQueueConsumeResponse,
  mapQueueEnterResponse,
  mapQueueStatusResponse,
} from '@/api/mappers/queueMappers'
import type {
  QueueAdmissionRequest,
  QueueAdmissionResult,
  QueueConsumeRequest,
  QueueConsumeResult,
  QueueIdentityRequest,
  QueueStatusData,
} from '@/types/queue'

export async function enterQueue(payload: QueueIdentityRequest): Promise<QueueStatusData> {
  const response = await apiClient.post('/api/v1/queue/enter', payload)
  return mapQueueEnterResponse(response.data)
}

export async function getQueueStatus(params: QueueIdentityRequest): Promise<QueueStatusData> {
  const response = await apiClient.get('/api/v1/queue/status', { params })
  return mapQueueStatusResponse(response.data)
}

export async function admitNextBatch(payload: QueueAdmissionRequest): Promise<QueueAdmissionResult> {
  const response = await apiClient.post('/api/v1/queue/admit', payload)
  return mapQueueAdmissionResponse(response.data)
}

export async function consumeAdmissionToken(payload: QueueConsumeRequest): Promise<QueueConsumeResult> {
  const response = await apiClient.post('/api/v1/queue/admission/consume', payload)
  return mapQueueConsumeResponse(response.data)
}
