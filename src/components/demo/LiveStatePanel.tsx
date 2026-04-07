import Alert from '@/components/ui/Alert'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { CouponIssueResult } from '@/types/coupon'
import type { DemoMonitorData } from '@/types/demo'
import type { QueueAdmissionResult, QueueStatusData } from '@/types/queue'
import { cn } from '@/utils/cn'
import { formatDateTime, formatNumber, formatQueueStatusLabel } from '@/utils/format'

export interface DemoApiLogEntry {
  id: string
  method: 'GET' | 'POST'
  endpoint: string
  requestedAt: string
  status: 'success' | 'error' | 'info'
  summary: string
  response?: unknown
  durationMs?: number
}

interface LiveStatePanelProps {
  userId: string
  eventId: number
  monitor: DemoMonitorData | null
  initialQueueLength: number | null
  queueStatus: QueueStatusData | null
  couponResult: CouponIssueResult | null
  lastApi: string | null
  lastRequestAt: string | null
  lastResponseStatus: string
  errorMessage: string | null
  logs: DemoApiLogEntry[]
  latestAdmitResult: QueueAdmissionResult | null
  guideMessage: string
  lastResponse: unknown
  isAdmitting: boolean
  isResetting: boolean
  onAdmitNext: () => void
  onResetCoupons: () => void
}

const logToneClass: Record<DemoApiLogEntry['status'], string> = {
  success: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-50',
  error: 'border-rose-300/30 bg-rose-400/10 text-rose-50',
  info: 'border-sky-300/30 bg-sky-400/10 text-sky-50',
}

function formatDuration(value?: number) {
  if (value === null || value === undefined) {
    return '-'
  }

  return `${Math.round(value)} ms`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatWaitSeconds(value?: number | null) {
  if (value === null || value === undefined) {
    return '-'
  }

  if (value < 60) {
    return `${value}s`
  }

  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}

function getP99Latency(logs: DemoApiLogEntry[]) {
  const durations = logs
    .map((log) => log.durationMs)
    .filter((value): value is number => typeof value === 'number')
    .sort((left, right) => left - right)

  if (durations.length === 0) {
    return null
  }

  const index = Math.min(durations.length - 1, Math.ceil(durations.length * 0.99) - 1)
  return durations[index]
}

function getErrorRate(logs: DemoApiLogEntry[]) {
  const measurableLogs = logs.filter((log) => typeof log.durationMs === 'number')
  if (measurableLogs.length === 0) {
    return 0
  }

  const errorCount = measurableLogs.filter((log) => log.status === 'error').length
  return (errorCount / measurableLogs.length) * 100
}

function getCongestionTone(level: DemoMonitorData['congestionLevel']) {
  switch (level) {
    case 'LOW':
      return 'success'
    case 'MEDIUM':
      return 'warning'
    case 'HIGH':
      return 'danger'
    default:
      return 'neutral'
  }
}

function MonitorMetric({
  label,
  value,
  caption,
  highlight = false,
}: {
  label: string
  value: string
  caption: string
  highlight?: boolean
}) {
  return (
    <div className={cn('rounded-[24px] border px-4 py-4', highlight ? 'border-orange-300/30 bg-orange-400/10' : 'border-white/10 bg-white/5')}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-300">{caption}</p>
    </div>
  )
}

function LiveStatePanel({
  userId,
  eventId,
  monitor,
  initialQueueLength,
  queueStatus,
  couponResult,
  lastApi,
  lastRequestAt,
  lastResponseStatus,
  errorMessage,
  logs,
  latestAdmitResult,
  guideMessage,
  lastResponse,
  isAdmitting,
  isResetting,
  onAdmitNext,
  onResetCoupons,
}: LiveStatePanelProps) {
  const queueStartCount = initialQueueLength ?? monitor?.queueLength ?? 0
  const drainedCount = Math.max(queueStartCount - (monitor?.queueLength ?? 0), 0)
  const p99Latency = getP99Latency(logs)
  const errorRate = getErrorRate(logs)

  return (
    <div className="xl:sticky xl:top-24">
      <Card
        title="Live Monitor"
        description="발표자가 지금 어떤 단계인지 바로 설명할 수 있도록 핵심 상태를 크게 모아둔 패널입니다."
        className="overflow-hidden border-slate-900 bg-[radial-gradient(circle_at_top,#172554_0%,#0f172a_42%,#020617_100%)] text-white shadow-soft"
        titleClassName="text-white"
        descriptionClassName="text-slate-200"
      >
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Current Step</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                  {queueStatus ? formatQueueStatusLabel(queueStatus.status) : '대기열 진입 전'}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {queueStatus ? <StatusBadge status={queueStatus.status} /> : <Badge tone="neutral">READY</Badge>}
                <Badge tone={getCongestionTone(monitor?.congestionLevel ?? 'UNKNOWN')}>{monitor?.congestionLevel ?? 'UNKNOWN'}</Badge>
              </div>
            </div>

            <div className="mt-4">
              <Alert tone="info" title="Next Step">
                {guideMessage}
              </Alert>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <MonitorMetric label="Queue Status" value={queueStatus?.status ?? 'READY'} caption={queueStatus ? formatQueueStatusLabel(queueStatus.status) : '아직 대기열에 들어가지 않았습니다.'} highlight />
            <MonitorMetric label="Coupon Result" value={couponResult?.outcome ?? 'PENDING'} caption={couponResult?.message ?? '쿠폰 발급이 아직 시작되지 않았습니다.'} />
            <MonitorMetric label="My Position" value={formatNumber(queueStatus?.currentPosition)} caption="로그인한 사용자 기준 현재 순번" />
            <MonitorMetric label="Queue Length" value={formatNumber(monitor?.queueLength)} caption="현재 이벤트 대기열 전체 길이" />
            <MonitorMetric label="Coupon Remaining" value={formatNumber(monitor?.couponRemainingCount)} caption="실시간 쿠폰 잔여 수량" />
            <MonitorMetric label="Estimated Wait" value={formatWaitSeconds(monitor?.estimatedWaitSeconds)} caption={`Batch ${formatNumber(monitor?.admissionBatchSize)} / ${formatWaitSeconds(((monitor?.schedulerDelayMs ?? 1000) / 1000))}`} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Performance</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">P99 Latency</p>
                  <p className="mt-2 text-xl font-black text-white">{formatDuration(p99Latency ?? undefined)}</p>
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Error Rate</p>
                  <p className="mt-2 text-xl font-black text-white">{formatPercent(errorRate)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Queue Flow</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Initial Queue</p>
                  <p className="mt-2 text-xl font-black text-white">{formatNumber(queueStartCount)}</p>
                </div>
                <div className="rounded-2xl bg-emerald-400/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">Processed Users</p>
                  <p className="mt-2 text-xl font-black text-emerald-50">{formatNumber(drainedCount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Identity</p>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Current User</p>
                  <p className="mt-1 font-mono text-white">{userId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Event ID</p>
                  <p className="mt-1 font-semibold text-white">{eventId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Queue Token</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-200">{queueStatus?.queueToken ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Admission Token</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-200">{queueStatus?.admissionToken ?? '-'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Latest Request</p>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Last API</p>
                  <p className="mt-1 font-mono text-white">{lastApi ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Last Response Status</p>
                  <p className="mt-1 font-semibold text-white">{lastResponseStatus}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Last Requested At</p>
                  <p className="mt-1 font-semibold text-white">{formatDateTime(lastRequestAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {errorMessage ? (
            <Alert tone="danger" title="Error">
              {errorMessage}
            </Alert>
          ) : null}

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Demo Control</p>
                <p className="mt-1 text-sm text-slate-300">발표 중 흐름을 빠르게 보여주기 위한 수동 admit 제어입니다.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" isLoading={isAdmitting} onClick={onAdmitNext}>
                  admit 1 user
                </Button>
              </div>
            </div>

            {latestAdmitResult ? (
              <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50">
                requested {formatNumber(latestAdmitResult.requestedCount)} / admitted {formatNumber(latestAdmitResult.admittedCount)}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Recent API Logs</p>
                <Badge tone="info">{logs.length}</Badge>
              </div>

              <div className="mt-3 space-y-3">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <article key={log.id} className={cn('rounded-2xl border px-4 py-3 text-sm', logToneClass[log.status])}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">
                          {log.method} {log.endpoint}
                        </p>
                        <span className="text-xs opacity-80">{formatDateTime(log.requestedAt)}</span>
                      </div>
                      <p className="mt-2 text-sm">{log.summary}</p>
                      {typeof log.durationMs === 'number' ? <p className="mt-2 text-xs opacity-80">duration {formatDuration(log.durationMs)}</p> : null}
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300">
                    No API activity has been recorded yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Last Response Payload</p>
              <div className="mt-3 rounded-2xl bg-black/40 px-4 py-3 text-xs text-slate-100">
                <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(lastResponse ?? { message: 'No response captured yet.' }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default LiveStatePanel
