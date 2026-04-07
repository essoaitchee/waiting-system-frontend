import type { CouponIssueApiResponse, CouponResetApiResponse, CouponStockApiResponse } from '@/types/api'
import type { CouponIssueResult, CouponListItem, CouponResetResult } from '@/types/coupon'
import { pickNumber, pickString, unwrapPayload } from '@/api/mappers/shared'

export function mapCouponIssueResponse(payload: unknown): CouponIssueResult {
  const source = unwrapPayload(payload) as CouponIssueApiResponse

  return {
    couponId: pickNumber(source, ['couponId', 'id']),
    userId: pickString(source, ['userId', 'memberId']) ?? '',
    status: pickString(source, ['status', 'issueStatus']) ?? 'UNKNOWN',
    remainingCount: pickNumber(source, ['remainingCount', 'remainCount', 'stock']),
    issuedAt: pickString(source, ['issuedAt', 'createdAt']),
    outcome: 'SUCCESS',
    message: '쿠폰 발급이 완료되었습니다.',
  }
}

export function mapCouponStockResponse(payload: unknown): CouponListItem {
  const source = unwrapPayload(payload) as CouponStockApiResponse

  return {
    couponId: pickNumber(source, ['couponId']) ?? 0,
    couponName: pickString(source, ['couponName']) ?? 'Coupon',
    totalCount: pickNumber(source, ['totalCount']),
    remainingCount: pickNumber(source, ['remainCount', 'remainingCount']),
    status: pickString(source, ['status']) ?? 'UNKNOWN',
    available: Boolean(source.available ?? false),
    issued: Boolean(source.issued ?? false),
    issuedAt: pickString(source, ['issuedAt']),
  }
}

export function mapCouponStockListResponse(payload: unknown): CouponListItem[] {
  if (!Array.isArray(payload)) {
    const unwrapped = unwrapPayload(payload)
    if (!Array.isArray(unwrapped)) {
      return []
    }

    return unwrapped.map((item) => mapCouponStockResponse(item))
  }

  return payload.map((item) => mapCouponStockResponse(item))
}

export function mapCouponResetResponse(payload: unknown): CouponResetResult {
  const source = unwrapPayload(payload) as CouponResetApiResponse

  return {
    userId: pickString(source, ['userId']) ?? '',
    resetCount: pickNumber(source, ['resetCount']) ?? 0,
    message: pickString(source, ['message']) ?? '쿠폰 발급 이력이 초기화되었습니다.',
  }
}
