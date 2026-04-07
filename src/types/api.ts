export interface ApiErrorPayload {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  [key: string]: unknown
}

export interface AuthLoginApiResponse {
  loginId?: string | null
  userId?: string | null
  created?: boolean | null
  message?: string | null
  [key: string]: unknown
}

export interface QueueEnterApiResponse {
  eventId?: number | null
  userId?: string
  status?: string
  queueToken?: string
  queueNumber?: number | null
  currentPosition?: number | null
  aheadCount?: number | null
  enteredAt?: string | null
  admissionToken?: string | null
  admissionExpiresAt?: string | null
  [key: string]: unknown
}

export interface QueueStatusApiResponse extends QueueEnterApiResponse {
  admittedAt?: string | null
}

export interface QueueConsumeApiResponse {
  eventId?: number | null
  userId?: string
  status?: string
  processedAt?: string | null
  [key: string]: unknown
}

export interface QueueAdmissionUserApiResponse {
  userId?: string
  queueToken?: string | null
  admissionToken?: string | null
  admissionExpiresAt?: string | null
  [key: string]: unknown
}

export interface QueueAdmissionApiResponse {
  eventId?: number | null
  requestedCount?: number | null
  admittedCount?: number | null
  admittedUsers?: QueueAdmissionUserApiResponse[]
  [key: string]: unknown
}

export interface ProductApiResponse {
  productId?: number | null
  categoryId?: number | null
  productName?: string
  price?: number | null
  stockCount?: number | null
  status?: string
  [key: string]: unknown
}

export interface CouponIssueApiResponse {
  couponId?: number | null
  userId?: string
  status?: string
  remainingCount?: number | null
  issuedAt?: string | null
  [key: string]: unknown
}

export interface CouponStockApiResponse {
  couponId?: number | null
  couponName?: string | null
  totalCount?: number | null
  remainCount?: number | null
  status?: string | null
  available?: boolean | null
  issued?: boolean | null
  issuedAt?: string | null
  [key: string]: unknown
}

export interface CouponResetApiResponse {
  userId?: string | null
  resetCount?: number | null
  message?: string | null
  [key: string]: unknown
}

export interface DemoMonitorApiResponse {
  eventId?: number | null
  couponId?: number | null
  couponName?: string | null
  userId?: string
  queueLength?: number | null
  estimatedWaitSeconds?: number | null
  admissionBatchSize?: number | null
  schedulerDelayMs?: number | null
  congestionLevel?: string | null
  queueStatus?: string
  queueToken?: string | null
  queueNumber?: number | null
  currentPosition?: number | null
  aheadCount?: number | null
  admissionToken?: string | null
  admissionExpiresAt?: string | null
  couponRemainingCount?: number | null
  couponTotalCount?: number | null
  couponStatus?: string | null
  simulatedUsers?: number | null
  reactionTimeMs?: number | null
  clickedAtEpochMs?: number | null
  [key: string]: unknown
}

export interface DemoRoundLeaderboardEntryApiResponse {
  rank?: number | null
  userId?: string | null
  couponId?: number | null
  couponName?: string | null
  reactionTimeMs?: number | null
  clickedAtEpochMs?: number | null
  [key: string]: unknown
}

export interface DemoRoundApiResponse {
  serverNowEpochMs?: number | null
  currentRoundStartEpochMs?: number | null
  nextRoundStartEpochMs?: number | null
  openWindowEndsAtEpochMs?: number | null
  countdownMs?: number | null
  phaseRemainingMs?: number | null
  roundIntervalSeconds?: number | null
  openWindowSeconds?: number | null
  open?: boolean | null
  phase?: string | null
  currentRoundLabel?: string | null
  leaderboardRoundLabel?: string | null
  myReactionTimeMs?: number | null
  myClickedAtEpochMs?: number | null
  leaderboard?: DemoRoundLeaderboardEntryApiResponse[] | null
  [key: string]: unknown
}
