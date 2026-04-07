import axios from 'axios'
import type { ApiErrorPayload } from '@/types/api'
import type { CouponIssueOutcome } from '@/types/coupon'

export interface AppError {
  statusCode: number | null
  title: string
  message: string
  payload?: ApiErrorPayload | null
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === 'object' && value !== null
}

export function parseApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status ?? null
    const payload = isApiErrorPayload(error.response?.data) ? error.response?.data : null
    const serverMessage =
      payload?.message ||
      (typeof error.response?.data === 'string' ? error.response.data : '') ||
      error.message

    switch (statusCode) {
      case 400:
        return { statusCode, title: '잘못된 요청', message: serverMessage || '입력 값을 다시 확인해 주세요.', payload }
      case 404:
        return { statusCode, title: '대상 없음', message: serverMessage || '요청한 정보를 찾을 수 없습니다.', payload }
      case 409:
        return { statusCode, title: '처리 충돌', message: serverMessage || '현재 상태에서는 요청을 진행할 수 없습니다.', payload }
      case 429:
        return { statusCode, title: '요청 과다', message: serverMessage || '잠시 후 다시 시도해 주세요.', payload }
      case 500:
        return { statusCode, title: '서버 오류', message: serverMessage || '서버 내부 오류가 발생했습니다.', payload }
      default:
        if (!statusCode) {
          return {
            statusCode: null,
            title: '연결 실패',
            message: '백엔드 서버와 연결되지 않았습니다. API 서버 주소와 실행 상태를 확인해 주세요.',
            payload,
          }
        }

        return {
          statusCode,
          title: '요청 실패',
          message: serverMessage || '요청 처리 중 알 수 없는 문제가 발생했습니다.',
          payload,
        }
    }
  }

  if (error instanceof Error) {
    return {
      statusCode: null,
      title: '오류 발생',
      message: error.message,
    }
  }

  return {
    statusCode: null,
    title: '오류 발생',
    message: '알 수 없는 오류가 발생했습니다.',
  }
}

export function classifyCouponOutcome(error: AppError): CouponIssueOutcome {
  const message = error.message

  if (error.statusCode === 409 && /이미|중복/.test(message)) {
    return 'DUPLICATE'
  }

  if (error.statusCode === 409 && /소진|품절/.test(message)) {
    return 'SOLD_OUT'
  }

  if (error.statusCode === 404) {
    return 'NOT_FOUND'
  }

  return 'ERROR'
}
