import type { AuthLoginApiResponse } from '@/types/api'
import type { AuthLoginResult } from '@/types/auth'
import { pickString, unwrapPayload } from '@/api/mappers/shared'

export function mapAuthLoginResponse(payload: unknown): AuthLoginResult {
  const source = unwrapPayload(payload) as AuthLoginApiResponse

  return {
    loginId: pickString(source, ['loginId', 'userId']) ?? '',
    created: Boolean(source.created),
    message: pickString(source, ['message']) ?? '',
  }
}
