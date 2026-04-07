import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const alertClasses: Record<AlertTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
}

interface AlertProps {
  title?: string
  tone?: AlertTone
  children: ReactNode
  className?: string
}

function Alert({ title, tone = 'info', children, className }: AlertProps) {
  return (
    <div className={cn('rounded-2xl border px-4 py-3', alertClasses[tone], className)}>
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      <div className={cn('text-sm', title && 'mt-1')}>{children}</div>
    </div>
  )
}

export default Alert
