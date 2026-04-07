import { Badge } from '@/components/ui/Badge'

interface CountdownOpenBarProps {
  isOpen: boolean
  displayMs: number
  cycleProgressPercent: number
  openWindowPercent: number
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(Math.ceil(ms / 1000), 0)
  return `${String(totalSeconds).padStart(2, '0')}초`
}

function CountdownOpenBar({ isOpen, displayMs, cycleProgressPercent, openWindowPercent }: CountdownOpenBarProps) {
  return (
    <section className="sticky top-4 z-30 overflow-hidden rounded-[30px] border border-orange-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#fff1f2_100%)] px-5 py-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">Open Countdown</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {isOpen ? '쿠폰 오픈 중' : `다음 쿠폰 오픈까지 ${formatCountdown(displayMs)}`}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isOpen
              ? '지금이 오픈 타이밍입니다. 버튼이 활성화되어 있으며, 클릭 속도가 이번 라운드 리더보드에 기록됩니다.'
              : '1분 주기로 열리는 오픈 라운드를 기다리는 중입니다. 바가 줄어들수록 정각 오픈이 가까워집니다.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge tone={isOpen ? 'success' : 'warning'}>{isOpen ? 'OPEN NOW' : 'LOCKED'}</Badge>
          <div className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            {isOpen ? `남은 오픈 타임 ${formatCountdown(displayMs)}` : `정각까지 ${formatCountdown(displayMs)}`}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="h-5 overflow-hidden rounded-full bg-orange-100">
          <div
            className={`h-full rounded-full transition-all duration-200 ${isOpen ? 'bg-[linear-gradient(90deg,#16a34a_0%,#22c55e_60%,#86efac_100%)]' : 'bg-[linear-gradient(90deg,#f97316_0%,#fb923c_60%,#fdba74_100%)]'}`}
            style={{ width: `${isOpen ? openWindowPercent : cycleProgressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          <span>{isOpen ? 'open window' : 'countdown'}</span>
          <span>{isOpen ? 'reaction speed race live' : 'gate unlock on zero'}</span>
        </div>
      </div>
    </section>
  )
}

export default CountdownOpenBar
