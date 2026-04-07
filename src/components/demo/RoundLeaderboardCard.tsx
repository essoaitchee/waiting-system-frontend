import type { ReactNode } from 'react'
import Card from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import type { DemoRoundData } from '@/types/demo'

function formatReaction(ms: number | null | undefined) {
  if (ms === null || ms === undefined) {
    return '-'
  }

  return `${(ms / 1000).toFixed(2)}초`
}

function formatClickedAt(epochMs: number | null | undefined) {
  if (!epochMs) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(epochMs))
}

interface RoundLeaderboardCardProps {
  round: DemoRoundData | null
  action?: ReactNode
  className?: string
}

function RoundLeaderboardCard({ round, action, className }: RoundLeaderboardCardProps) {
  return (
    <Card
      title="클릭 속도 리더보드"
      description="이번 데모에서 기록된 전체 클릭 속도를 가장 빠른 순서대로 보여줍니다."
      action={action}
      className={cn('h-full', className)}
    >
      <div className="flex h-full flex-col gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Scope</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {round?.leaderboardRoundLabel ?? 'ALL RECORDS'}
            </p>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">My Best Speed</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-orange-600">
              {formatReaction(round?.myReactionTimeMs)}
            </p>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">My Last Click</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
              {formatClickedAt(round?.myClickedAtEpochMs)}
            </p>
          </article>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
          <div className="grid grid-cols-[64px_minmax(180px,1.5fr)_92px_132px] gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <span>Rank</span>
            <span>User</span>
            <span>Speed</span>
            <span>Clicked At</span>
          </div>

          <div className="divide-y divide-slate-100">
            {round?.leaderboard.length ? (
              round.leaderboard.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.userId}-${entry.clickedAtEpochMs}`}
                  className="grid grid-cols-[64px_minmax(180px,1.5fr)_92px_132px] gap-3 px-5 py-4 text-sm text-slate-700"
                >
                  <div className="flex items-center">
                    <span className="inline-flex min-w-12 items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">
                      #{entry.rank}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{entry.userId}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{entry.couponName ?? '쿠폰 이벤트'}</p>
                  </div>

                  <div className="flex items-center">
                    <span className="font-black text-orange-600">{formatReaction(entry.reactionTimeMs)}</span>
                  </div>

                  <div className="flex items-center text-xs leading-5 text-slate-600">
                    {formatClickedAt(entry.clickedAtEpochMs)}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                아직 기록이 없습니다. 오픈 순간 쿠폰을 눌러 첫 클릭 기록을 만들어보세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default RoundLeaderboardCard
