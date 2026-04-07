import { apiClient } from '@/api/client'
import { mapAuthLoginResponse } from '@/api/mappers/authMappers'
import type { AuthLoginRequest, AuthLoginResult } from '@/types/auth'

export async function loginOrRegister(payload: AuthLoginRequest): Promise<AuthLoginResult> {
  const response = await apiClient.post('/api/v1/auth/login', payload)
  return mapAuthLoginResponse(response.data)
}
