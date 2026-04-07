import Alert from '@/components/ui/Alert'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { CouponIssueResult } from '@/types/coupon'
import type { DemoMonitorData } from '@/types/demo'
import type { QueueConsumeResult, QueueStatusData } from '@/types/queue'
import { formatDateTime, formatNumber } from '@/utils/format'

interface QueueJourneyModalProps {
  isOpen: boolean
  monitor: DemoMonitorData | null
  initialQueueLength: number | null
  initialQueuePosition: number | null
  queueStatus: QueueStatusData | null
  consumeResult: QueueConsumeResult | null
  couponResult: CouponIssueResult | null
  userMessage: string
  isLoading: boolean
  onClose: () => void
  onPrimaryAction: () => void
}

function QueueJourneyModal({
  isOpen,
  monitor,
  initialQueueLength,
  initialQueuePosition,
  queueStatus,
  consumeResult,
  couponResult,
  userMessage,
  isLoading,
  onClose,
  onPrimaryAction,
}: QueueJourneyModalProps) {
  if (!isOpen) {
    return null
  }

  const primaryLabel =
    queueStatus?.status === 'ADMITTED'
      ? '쿠폰 발급 계속하기'
      : queueStatus?.status === 'ENTERED'
        ? '쿠폰 발급하기'
        : queueStatus?.status === 'WAITING'
          ? '상태 새로고침'
          : '대기열 입장하기'

  const totalQueueLength = monitor?.queueLength ?? 0
  const queueStartCount = initialQueueLength ?? monitor?.queueLength ?? 0
  const totalDrainedCount = Math.max(queueStartCount - totalQueueLength, 0)

  const myQueueStart = initialQueuePosition ?? queueStatus?.currentPosition ?? 0
  const myCurrentQueue =
    queueStatus?.status === 'WAITING'
      ? Math.max(queueStatus.currentPosition ?? queueStatus.aheadCount ?? 0, 0)
      : queueStatus?.status === 'ADMITTED' || queueStatus?.status === 'ENTERED'
        ? 0
        : myQueueStart
  const myDrainedCount = Math.max(myQueueStart - myCurrentQueue, 0)
  const myQueueProgress = myQueueStart > 0 ? Math.min((myDrainedCount / myQueueStart) * 100, 100) : 0

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-soft">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#fff8ef_0%,#ffffff_55%,#eff6ff_100%)] px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Coupon Queue</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">선착순 쿠폰 대기열</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{userMessage}</p>
            </div>
            <button
              type="button"
              className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {queueStatus ? <StatusBadge status={queueStatus.status} /> : <Badge tone="neutral">READY</Badge>}
            {queueStatus?.canEnter ? <Badge tone="success">입장 가능</Badge> : null}
            {couponResult?.outcome === 'SUCCESS' ? <Badge tone="success">쿠폰 발급 완료</Badge> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">현재 대기 순번</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{formatNumber(queueStatus?.currentPosition)}</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">입장 가능 여부</p>
              <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                {queueStatus?.canEnter ? '지금 입장 가능' : queueStatus ? '대기 중' : '진입 전'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">전체 대기열 길이</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{formatNumber(monitor?.queueLength)}</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">남은 쿠폰 수량</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{formatNumber(monitor?.couponRemainingCount)}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Live Queue Flow</p>
                <h4 className="mt-2 text-lg font-black tracking-tight text-slate-950">내 앞 대기 인원이 실시간으로 줄어들고 있습니다</h4>
              </div>
              <Badge tone={myDrainedCount > 0 ? 'success' : 'neutral'}>{formatNumber(myDrainedCount)}명 통과</Badge>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#f97316_0%,#fb923c_55%,#fdba74_100%)] transition-all duration-700"
                style={{ width: `${myQueueProgress}%` }}
              />
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">시작 순번</p>
                <p className="mt-1 text-base font-bold text-slate-950">{formatNumber(myQueueStart)}명</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">현재 내 순번</p>
                <p className="mt-1 text-base font-bold text-slate-950">{formatNumber(myCurrentQueue)}명</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">전체 처리 인원</p>
                <p className="mt-1 text-base font-bold text-slate-950">{formatNumber(totalDrainedCount)}명</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[24px] border border-slate-200 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Queue Token</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-700">{queueStatus?.queueToken ?? '-'}</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Admission Token</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-700">{queueStatus?.admissionToken ?? '-'}</p>
            </div>
          </div>

          {queueStatus?.canEnter ? (
            <Alert tone="success" title="이제 입장할 수 있습니다">
              admission token이 발급되었습니다. 버튼을 누르면 입장 처리 후 쿠폰 발급 단계로 이어집니다.
            </Alert>
          ) : null}

          {consumeResult ? (
            <Alert tone="info" title="입장 처리 완료">
              {formatDateTime(consumeResult.processedAt)}에 ENTERED 상태로 전환되었습니다.
            </Alert>
          ) : null}

          {couponResult ? (
            <Alert
              tone={
                couponResult.outcome === 'SUCCESS'
                  ? 'success'
                  : couponResult.outcome === 'ERROR'
                    ? 'danger'
                    : 'warning'
              }
              title={
                couponResult.outcome === 'SUCCESS'
                  ? '쿠폰이 발급되었습니다'
                  : couponResult.outcome === 'DUPLICATE'
                    ? '이미 발급받은 쿠폰입니다'
                    : couponResult.outcome === 'SOLD_OUT'
                      ? '준비된 쿠폰이 모두 소진되었습니다'
                      : '쿠폰 발급 결과를 확인해 주세요'
              }
            >
              {couponResult.message}
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" isLoading={isLoading} onClick={onPrimaryAction}>
              {primaryLabel}
            </Button>
            <Button variant="secondary" size="lg" onClick={onClose}>
              뒤로 가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueueJourneyModal
