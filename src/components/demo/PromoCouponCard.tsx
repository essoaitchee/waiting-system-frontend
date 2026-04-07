import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { CouponListItem } from '@/types/coupon'
import { formatDateTime, formatNumber } from '@/utils/format'

interface PromoCouponCardProps {
  coupon: CouponListItem
  isSelected: boolean
  isLoading: boolean
  isRoundOpen: boolean
  onSelect: (coupon: CouponListItem) => void
}

function PromoCouponCard({ coupon, isSelected, isLoading, isRoundOpen, onSelect }: PromoCouponCardProps) {
  const isDisabled = coupon.issued || !coupon.available || !isRoundOpen || isLoading

  function handleSelect() {
    if (isDisabled) {
      return
    }

    onSelect(coupon)
  }

  return (
    <article
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleSelect()
        }
      }}
      className={`rounded-[28px] border px-5 py-5 shadow-panel transition ${
        isSelected ? 'border-orange-300 bg-orange-50/70' : 'border-white/80 bg-white'
      } ${isDisabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-soft'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Coupon Drop</p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">{coupon.couponName}</h3>
        </div>
        <Badge tone={coupon.issued ? 'neutral' : !coupon.available ? 'danger' : isRoundOpen ? 'success' : 'warning'}>
          {coupon.issued ? 'ISSUED' : !coupon.available ? 'SOLD OUT' : isRoundOpen ? 'OPEN NOW' : 'LOCKED'}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/80 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Remaining</p>
          <p className="mt-2 text-lg font-bold text-slate-950">{formatNumber(coupon.remainingCount)}</p>
        </div>
        <div className="rounded-2xl bg-white/80 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total</p>
          <p className="mt-2 text-lg font-bold text-slate-950">{formatNumber(coupon.totalCount)}</p>
        </div>
      </div>

      {coupon.issued ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Already Issued</p>
          <p className="mt-2 text-sm font-medium text-emerald-900">이 계정으로 이미 발급받은 쿠폰입니다.</p>
          <p className="mt-1 text-xs text-emerald-700">
            {coupon.issuedAt ? `발급 시각 ${formatDateTime(coupon.issuedAt)}` : '발급 이력을 확인했습니다.'}
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {coupon.issued
          ? '오른쪽 상태 패널의 reset 버튼으로 발급 이력을 초기화한 뒤 다시 테스트할 수 있습니다.'
          : !coupon.available
            ? '현재 준비된 수량이 모두 소진되어 이 쿠폰으로는 대기열을 시작할 수 없습니다.'
            : isRoundOpen
              ? '지금은 오픈 상태입니다. 버튼을 누르면 즉시 대기열에 입장하고 클릭 속도도 함께 기록됩니다.'
              : '오픈 전에는 버튼이 잠겨 있습니다. 상단 카운트다운이 끝나면 대기열 입장이 열립니다.'}
      </p>

      <div className="mt-5 flex gap-3">
        <Button
          size="md"
          className="bg-orange-500 hover:bg-orange-600"
          disabled={isDisabled}
          isLoading={isLoading}
          onClick={(event) => {
            event.stopPropagation()
            handleSelect()
          }}
        >
          {coupon.issued ? '이미 발급됨' : !coupon.available ? '선택 불가' : isRoundOpen ? '대기열 입장' : '오픈 대기 중'}
        </Button>
      </div>
    </article>
  )
}

export default PromoCouponCard
