import type { DemoMonitorApiResponse, DemoRoundApiResponse } from '@/types/api'
import type { DemoMonitorData, DemoRoundData } from '@/types/demo'
import type { QueueStatusCode } from '@/types/queue'
import { pickNumber, pickString, unwrapPayload } from '@/api/mappers/shared'

function normalizeQueueStatus(value: string | null): QueueStatusCode {
  const normalized = value?.toUpperCase()

  if (normalized === 'WAITING' || normalized === 'ADMITTED' || normalized === 'ENTERED' || normalized === 'EXPIRED') {
    return normalized
  }

  if (normalized === 'FAILED') {
    return 'FAILED'
  }

  return 'UNKNOWN'
}

export function mapDemoMonitorResponse(payload: unknown): DemoMonitorData {
  const source = unwrapPayload(payload) as DemoMonitorApiResponse
  const status = normalizeQueueStatus(pickString(source, ['queueStatus', 'status']))
  const admissionToken = pickString(source, ['admissionToken'])
  const congestionLevel = pickString(source, ['congestionLevel'])?.toUpperCase()

  return {
    eventId: pickNumber(source, ['eventId']) ?? 1001,
    couponId: pickNumber(source, ['couponId']) ?? 1,
    couponName: pickString(source, ['couponName']),
    userId: pickString(source, ['userId']) ?? '',
    queueLength: pickNumber(source, ['queueLength']) ?? 0,
    estimatedWaitSeconds: pickNumber(source, ['estimatedWaitSeconds']) ?? 0,
    admissionBatchSize: pickNumber(source, ['admissionBatchSize']) ?? 1,
    schedulerDelayMs: pickNumber(source, ['schedulerDelayMs']) ?? 1000,
    congestionLevel:
      congestionLevel === 'LOW' || congestionLevel === 'MEDIUM' || congestionLevel === 'HIGH' ? congestionLevel : 'UNKNOWN',
    status,
    queueToken: pickString(source, ['queueToken']),
    queueNumber: pickNumber(source, ['queueNumber', 'queueSequence']),
    currentPosition: pickNumber(source, ['currentPosition', 'position']),
    aheadCount: pickNumber(source, ['aheadCount']),
    admissionToken,
    admissionExpiresAt: pickString(source, ['admissionExpiresAt']),
    couponRemainingCount: pickNumber(source, ['couponRemainingCount', 'remainingCount']),
    couponTotalCount: pickNumber(source, ['couponTotalCount', 'totalCount']),
    couponStatus: pickString(source, ['couponStatus']),
    simulatedUsers: pickNumber(source, ['simulatedUsers']) ?? 0,
    reactionTimeMs: pickNumber(source, ['reactionTimeMs']),
    clickedAtEpochMs: pickNumber(source, ['clickedAtEpochMs']),
    canEnter: status === 'ADMITTED' && Boolean(admissionToken),
    isExpired: status === 'EXPIRED',
  }
}

export function mapDemoRoundResponse(payload: unknown): DemoRoundData {
  const source = unwrapPayload(payload) as DemoRoundApiResponse
  const leaderboard = Array.isArray(source.leaderboard) ? source.leaderboard : []

  return {
    serverNowEpochMs: pickNumber(source, ['serverNowEpochMs']) ?? Date.now(),
    currentRoundStartEpochMs: pickNumber(source, ['currentRoundStartEpochMs']) ?? Date.now(),
    nextRoundStartEpochMs: pickNumber(source, ['nextRoundStartEpochMs']) ?? Date.now(),
    openWindowEndsAtEpochMs: pickNumber(source, ['openWindowEndsAtEpochMs']) ?? Date.now(),
    countdownMs: pickNumber(source, ['countdownMs']) ?? 0,
    phaseRemainingMs: pickNumber(source, ['phaseRemainingMs']) ?? 0,
    roundIntervalSeconds: pickNumber(source, ['roundIntervalSeconds']) ?? 10,
    openWindowSeconds: pickNumber(source, ['openWindowSeconds']) ?? 3,
    open: Boolean(source.open),
    phase: pickString(source, ['phase']) ?? 'COUNTDOWN',
    currentRoundLabel: pickString(source, ['currentRoundLabel']) ?? '',
    leaderboardRoundLabel: pickString(source, ['leaderboardRoundLabel']) ?? '',
    myReactionTimeMs: pickNumber(source, ['myReactionTimeMs']),
    myClickedAtEpochMs: pickNumber(source, ['myClickedAtEpochMs']),
    leaderboard: leaderboard.map((item, index) => ({
      rank: pickNumber(item, ['rank']) ?? index + 1,
      userId: pickString(item, ['userId']) ?? '',
      couponId: pickNumber(item, ['couponId']),
      couponName: pickString(item, ['couponName']),
      reactionTimeMs: pickNumber(item, ['reactionTimeMs']) ?? 0,
      clickedAtEpochMs: pickNumber(item, ['clickedAtEpochMs']) ?? 0,
    })),
  }
}
