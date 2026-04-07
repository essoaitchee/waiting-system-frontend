export interface CouponIssueRequest {
  couponId: number
  userId: string
}

export interface CouponListItem {
  couponId: number
  couponName: string
  totalCount: number | null
  remainingCount: number | null
  status: string
  available: boolean
  issued: boolean
  issuedAt: string | null
}

export type CouponIssueOutcome = 'SUCCESS' | 'DUPLICATE' | 'SOLD_OUT' | 'NOT_FOUND' | 'ERROR'

export interface CouponIssueResult {
  couponId: number | null
  userId: string
  status: string
  remainingCount: number | null
  issuedAt: string | null
  outcome: CouponIssueOutcome
  message: string
}

export interface CouponResetRequest {
  userId: string
}

export interface CouponResetResult {
  userId: string
  resetCount: number
  message: string
}
