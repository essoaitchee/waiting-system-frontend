import type { QueueStatusCode } from '@/types/queue'

export interface DemoJoinRequest {
  eventId?: number
  couponId?: number
  userId?: string
  burstSize?: number
  clickedAtEpochMs?: number
}

export interface DemoMonitorData {
  eventId: number
  couponId: number
  couponName: string | null
  userId: string
  queueLength: number
  estimatedWaitSeconds: number
  admissionBatchSize: number
  schedulerDelayMs: number
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  status: QueueStatusCode
  queueToken: string | null
  queueNumber: number | null
  currentPosition: number | null
  aheadCount: number | null
  admissionToken: string | null
  admissionExpiresAt: string | null
  couponRemainingCount: number | null
  couponTotalCount: number | null
  couponStatus: string | null
  simulatedUsers: number
  reactionTimeMs: number | null
  clickedAtEpochMs: number | null
  canEnter: boolean
  isExpired: boolean
}

export interface DemoRoundLeaderboardEntry {
  rank: number
  userId: string
  couponId: number | null
  couponName: string | null
  reactionTimeMs: number
  clickedAtEpochMs: number
}

export interface DemoRoundData {
  serverNowEpochMs: number
  currentRoundStartEpochMs: number
  nextRoundStartEpochMs: number
  openWindowEndsAtEpochMs: number
  countdownMs: number
  phaseRemainingMs: number
  roundIntervalSeconds: number
  openWindowSeconds: number
  open: boolean
  phase: string
  currentRoundLabel: string
  leaderboardRoundLabel: string
  myReactionTimeMs: number | null
  myClickedAtEpochMs: number | null
  leaderboard: DemoRoundLeaderboardEntry[]
}
