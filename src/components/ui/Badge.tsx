import type { ReactNode } from 'react'
import type { QueueStatusCode } from '@/types/queue'
import { cn } from '@/utils/cn'
import { formatQueueStatusLabel, getQueueStatusTone } from '@/utils/format'

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const badgeToneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-sky-100 text-sky-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', badgeToneClasses[tone], className)}>
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: QueueStatusCode
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge tone={getQueueStatusTone(status)}>{formatQueueStatusLabel(status)}</Badge>
}
