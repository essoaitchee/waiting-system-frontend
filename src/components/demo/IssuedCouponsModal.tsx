import Button from '@/components/ui/Button'
import type { CouponListItem } from '@/types/coupon'
import { formatDateTime, formatNumber } from '@/utils/format'

export type IssuedCouponsModalVariant = 'success' | 'soldOut'

interface IssuedCouponsModalProps {
  isOpen: boolean
  couponName: string | null
  coupons: CouponListItem[]
  variant?: IssuedCouponsModalVariant
  isResetting: boolean
  onReset: () => void
  onClose: () => void
}

function IssuedCouponsModal({
  isOpen,
  couponName,
  coupons,
  variant = 'success',
  isResetting,
  onReset,
  onClose,
}: IssuedCouponsModalProps) {
  if (!isOpen) {
    return null
  }

  const issuedCoupons = coupons.filter((coupon) => coupon.issued)
  const isSoldOut = variant === 'soldOut'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white p-6 shadow-soft sm:p-8">
        <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isSoldOut ? 'text-amber-600' : 'text-emerald-600'}`}>
          {isSoldOut ? 'Coupon Sold Out' : 'Coupon Issued'}
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          {isSoldOut ? '쿠폰이 모두 소진되었습니다' : couponName ? `${couponName} 쿠폰이 발급되었습니다!` : '쿠폰이 발급되었습니다!'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {isSoldOut
            ? '대기 중이던 쿠폰 수량이 모두 소진되어 이번 라운드는 종료되었습니다. 아래에서 현재 계정의 보유 쿠폰을 확인하거나 초기화 후 다시 테스트할 수 있습니다.'
            : '현재 계정으로 보유 중인 쿠폰 목록입니다. 테스트를 다시 진행하려면 아래에서 바로 초기화할 수 있습니다.'}
        </p>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">My Coupons</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">보유 쿠폰 {formatNumber(issuedCoupons.length)}개</h3>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {issuedCoupons.length > 0 ? (
              issuedCoupons.map((coupon) => (
                <article
                  key={coupon.couponId}
                  className="rounded-2xl border border-white bg-white px-4 py-4 shadow-panel"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-slate-950">{coupon.couponName}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">Issued At</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{formatDateTime(coupon.issuedAt)}</p>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      ISSUED
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                아직 보유 중인 쿠폰이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button size="lg" variant="ghost" onClick={onClose}>
            팝업 닫기
          </Button>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600" isLoading={isResetting} onClick={onReset}>
            내 쿠폰 초기화 하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default IssuedCouponsModal
