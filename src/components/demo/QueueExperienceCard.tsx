import FlowStageStrip from '@/components/demo/FlowStageStrip'
import Alert from '@/components/ui/Alert'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { CouponIssueResult } from '@/types/coupon'
import type { QueueConsumeResult, QueueStatusData } from '@/types/queue'
import { QUEUE_STATUS_POLL_INTERVAL_MS } from '@/utils/constants'
import { formatDateTime, formatNumber } from '@/utils/format'

type NoticeTone = 'info' | 'success' | 'warning' | 'danger'

interface UserNotice {
  tone: NoticeTone
  title: string
  body: string
}

interface QueueExperienceCardProps {
  userId: string
  personaOptions: string[]
  notice: UserNotice
  queueStatus: QueueStatusData | null
  consumeResult: QueueConsumeResult | null
  couponResult: CouponIssueResult | null
  lastRequestAt: string | null
  currentStep: number
  isRefreshing: boolean
  isPrimaryLoading: boolean
  onSelectPersona: (userId: string) => void
  onPrimaryAction: () => void
  onRefresh: () => void
  onReset: () => void
}

function QueueExperienceCard({
  userId,
  personaOptions,
  notice,
  queueStatus,
  consumeResult,
  couponResult,
  lastRequestAt,
  currentStep,
  isRefreshing,
  isPrimaryLoading,
  onSelectPersona,
  onPrimaryAction,
  onRefresh,
  onReset,
}: QueueExperienceCardProps) {
  const ctaLabel =
    queueStatus?.status === 'ADMITTED'
      ? '쿠폰 발급 계속하기'
      : queueStatus?.status === 'ENTERED'
        ? '쿠폰 발급 진행하기'
        : queueStatus?.status === 'WAITING'
          ? '대기 상태 다시 확인'
          : '선착순 쿠폰 받기'

  return (
    <Card
      title="쿠폰 대기열 경험"
      description="사용자는 복잡한 입력 없이 쿠폰 받기 버튼만 누르면 됩니다. 내부적으로는 eventId와 userId가 구성되고, 상태는 3초마다 자동으로 갱신됩니다."
    >
      <div className="space-y-6">
        <FlowStageStrip
          currentStep={currentStep}
          stages={[
            { title: '이벤트 진입', caption: '프로모션 랜딩 확인' },
            { title: '대기열 등록', caption: 'queue enter 호출' },
            { title: '입장 허용', caption: 'admission token 발급' },
            { title: '쿠폰 발급', caption: 'consume 후 issue 호출' },
          ]}
        />

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">데모 사용자 선택</span>
          {personaOptions.map((persona) => (
            <button
              key={persona}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                persona === userId ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => onSelectPersona(persona)}
            >
              {persona}
            </button>
          ))}
        </div>

        <Alert tone={notice.tone} title={notice.title}>
          {notice.body}
        </Alert>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current Journey</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  {queueStatus ? formatNumber(queueStatus.currentPosition) : '-'}
                  <span className="ml-2 text-base font-semibold text-slate-500">현재 대기 순번</span>
                </p>
              </div>
              {queueStatus ? <StatusBadge status={queueStatus.status} /> : <Badge tone="neutral">READY</Badge>}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Queue Token</p>
                <p className="mt-2 break-all font-mono text-xs text-slate-700">{queueStatus?.queueToken ?? '-'}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Admission Token</p>
                <p className="mt-2 break-all font-mono text-xs text-slate-700">{queueStatus?.admissionToken ?? '-'}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">입장 가능 여부</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {queueStatus?.canEnter ? '입장 가능' : queueStatus ? '대기 중' : '진입 전'}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">마지막 갱신</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(lastRequestAt)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Action Panel</p>
            <div className="mt-4 space-y-3">
              <Button fullWidth size="lg" isLoading={isPrimaryLoading} onClick={onPrimaryAction}>
                {ctaLabel}
              </Button>
              <Button fullWidth variant="secondary" onClick={onRefresh} isLoading={isRefreshing}>
                지금 상태 새로고침
              </Button>
              <Button fullWidth variant="ghost" onClick={onReset}>
                현재 사용자 흐름 초기화
              </Button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
              <p className="font-semibold text-white">자동화 포인트</p>
              <ul className="mt-3 space-y-2 text-slate-300">
                <li>eventId는 내부 상수 1001을 사용합니다.</li>
                <li>userId는 자동 생성 또는 빠른 선택으로 지정됩니다.</li>
                <li>대기 상태는 {QUEUE_STATUS_POLL_INTERVAL_MS / 1000}초마다 자동으로 갱신됩니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {queueStatus?.canEnter ? (
          <Alert tone="success" title="입장 가능 상태입니다">
            admission token이 발급되었습니다. 지금 버튼을 누르면 입장 처리 후 쿠폰 발급을 이어서 진행합니다.
          </Alert>
        ) : null}

        {consumeResult ? (
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm font-bold text-emerald-900">입장 처리 완료</p>
            <p className="mt-2 text-sm text-emerald-800">
              {consumeResult.userId} 사용자가 {formatDateTime(consumeResult.processedAt)}에 ENTERED 상태로 전환되었습니다.
            </p>
          </div>
        ) : null}

        {couponResult ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Coupon Issue Result</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{couponResult.outcome}</p>
              </div>
              <Badge
                tone={
                  couponResult.outcome === 'SUCCESS'
                    ? 'success'
                    : couponResult.outcome === 'ERROR'
                      ? 'danger'
                      : 'warning'
                }
              >
                {couponResult.status}
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{couponResult.message}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Coupon ID</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{couponResult.couponId ?? '-'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Remaining</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatNumber(couponResult.remainingCount)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Issued At</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(couponResult.issuedAt)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

export default QueueExperienceCard
