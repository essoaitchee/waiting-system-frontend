import { apiClient } from '@/api/client'
import { mapDemoMonitorResponse, mapDemoRoundResponse } from '@/api/mappers/demoMappers'
import type { DemoJoinRequest, DemoMonitorData, DemoRoundData } from '@/types/demo'

export async function demoJoinExperience(payload: DemoJoinRequest): Promise<DemoMonitorData> {
  const response = await apiClient.post('/api/v1/demo/join', payload)
  return mapDemoMonitorResponse(response.data)
}

export async function fetchDemoMonitor(params: { eventId?: number; couponId?: number; userId: string }): Promise<DemoMonitorData> {
  const response = await apiClient.get('/api/v1/demo/monitor', { params })
  return mapDemoMonitorResponse(response.data)
}

export async function fetchDemoRound(params: { userId: string }): Promise<DemoRoundData> {
  const response = await apiClient.get('/api/v1/demo/round', { params })
  return mapDemoRoundResponse(response.data)
}
