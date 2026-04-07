import PromoCouponCard from '@/components/demo/PromoCouponCard'
import RoundLeaderboardCard from '@/components/demo/RoundLeaderboardCard'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import type { CouponListItem } from '@/types/coupon'
import type { DemoRoundData } from '@/types/demo'
import type { QueueStatusData } from '@/types/queue'

interface DemoHeroProps {
  queueStatus: QueueStatusData | null
  round: DemoRoundData | null
  coupons: CouponListItem[]
  selectedCouponId: number | null
  isCouponLoading: boolean
  isRoundOpen: boolean
  onPrimaryAction: () => void
  onSecondaryAction: () => void
  onResetCoupons: () => void
  onCouponSelect: (coupon: CouponListItem) => void
  isActionLoading: boolean
  isResetting: boolean
  secondaryLabel: string
}

function DemoHero({
  queueStatus,
  round,
  coupons,
  selectedCouponId,
  isCouponLoading,
  isRoundOpen,
  onPrimaryAction,
  onSecondaryAction,
  onResetCoupons,
  onCouponSelect,
  isActionLoading,
  isResetting,
  secondaryLabel,
}: DemoHeroProps) {
  const hasActiveQueue = Boolean(queueStatus && (queueStatus.status === 'WAITING' || queueStatus.status === 'ADMITTED'))

  return (
    <section className="overflow-hidden rounded-[38px] border border-white/80 bg-[linear-gradient(135deg,#fff8ef_0%,#ffffff_48%,#edf6ff_100%)] shadow-soft">
      <div className="space-y-8 px-6 py-8 lg:px-10 lg:py-10">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="warning">LIMITED COUPON EVENT</Badge>
              <Badge tone={isRoundOpen ? 'success' : 'info'}>{isRoundOpen ? 'OPEN NOW' : 'COUNTDOWN'}</Badge>
              {queueStatus ? <Badge tone="neutral">{queueStatus.status}</Badge> : null}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button size="md" variant="ghost" isLoading={isResetting} onClick={onResetCoupons}>
                내 쿠폰 초기화
              </Button>
              <Button
                size="md"
                variant="secondary"
                className="bg-white text-slate-950 hover:bg-slate-100 focus-visible:outline-white"
                onClick={onSecondaryAction}
              >
                {secondaryLabel}
              </Button>
            </div>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Open Run Demo</p>
          <h2 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">

            선착순 쿠폰 이벤트
          </h2>
          <p className="max-w-4xl text-base leading-7 text-slate-600 sm:text-lg">
            원하는 쿠폰을 선택하면 대기열에 진입하고, 실시간 순번 변화와 입장 상태를 거쳐 자동으로 쿠폰 발급까지<br></br>
            이어지는 서비스형 데모입니다.
          </p>
        </div>

        <div className="flex items-stretch gap-8 max-[980px]:flex-col">
          <div className="min-w-0 flex-[6_1_0%] max-[980px]:flex-auto">
            <div className="h-full rounded-[32px] border border-orange-100 bg-white/80 p-5 shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Coupon Select</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    원하는 쿠폰을 선택하고 대기열에 참여하세요
                  </h3>
                </div>
                <p className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                  카드 클릭 즉시 대기열 입장
                </p>
              </div>

              {isCouponLoading ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="rounded-[28px] border border-white/80 bg-white p-5 shadow-panel">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="mt-3 h-7 w-3/4" />
                      <Skeleton className="mt-5 h-20 w-full rounded-2xl" />
                      <Skeleton className="mt-5 h-11 w-32 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : coupons.length > 0 ? (
                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                  {coupons.map((coupon) => (
                    <PromoCouponCard
                      key={coupon.couponId}
                      coupon={coupon}
                      isSelected={selectedCouponId === coupon.couponId}
                      isLoading={isActionLoading && selectedCouponId === coupon.couponId}
                      isRoundOpen={isRoundOpen}
                      onSelect={onCouponSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-lg font-bold text-slate-900">현재 참여 가능한 쿠폰이 없습니다</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    `coupon_stock` 데이터가 비어 있거나 모든 쿠폰이 소진된 상태입니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          <RoundLeaderboardCard
            round={round}
            className="h-full flex-[4_1_0%] max-[980px]:w-full max-[980px]:flex-auto"
            action={
              <div className="flex flex-wrap justify-end gap-3">
                {hasActiveQueue ? (
                  <Button size="md" variant="ghost" onClick={onPrimaryAction}>
                    대기열 상태 보기
                  </Button>
                ) : null}
              </div>
            }
          />
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-white/80 px-4 py-2">1분 주기로 새로운 오픈 라운드가 시작됩니다</span>
          <span className="rounded-full bg-white/80 px-4 py-2">클릭 속도는 서버에 저장되어 재시작 후에도 유지됩니다</span>
          <span className="rounded-full bg-white/80 px-4 py-2">대기열을 통과하면 자동으로 쿠폰 발급 단계가 이어집니다</span>
        </div>
      </div>
    </section>
  )
}

export default DemoHero
