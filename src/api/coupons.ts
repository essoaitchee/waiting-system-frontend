import { apiClient } from '@/api/client'
import { mapCouponIssueResponse, mapCouponResetResponse, mapCouponStockListResponse } from '@/api/mappers/couponMappers'
import type { CouponIssueRequest, CouponIssueResult, CouponListItem, CouponResetRequest, CouponResetResult } from '@/types/coupon'

export async function fetchCoupons(userId?: string): Promise<CouponListItem[]> {
  const response = await apiClient.get('/api/v1/coupons', {
    params: userId ? { userId } : undefined,
  })
  return mapCouponStockListResponse(response.data)
}

export async function issueCoupon(payload: CouponIssueRequest): Promise<CouponIssueResult> {
  const response = await apiClient.post('/api/v1/coupons/issue', payload)
  return mapCouponIssueResponse(response.data)
}

export async function resetCoupons(payload: CouponResetRequest): Promise<CouponResetResult> {
  const response = await apiClient.post('/api/v1/coupons/reset', payload)
  return mapCouponResetResponse(response.data)
}
