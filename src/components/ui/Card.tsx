import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  children: ReactNode
}

function Card({ title, description, action, className, titleClassName, descriptionClassName, children }: CardProps) {
  return (
    <section className={cn('glass-panel p-5 sm:p-6', className)}>
      {title || description || action ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className={cn('text-lg font-bold tracking-tight text-ink sm:text-xl', titleClassName)}>{title}</h2> : null}
            {description ? <p className={cn('mt-2 text-sm text-slate-600', descriptionClassName)}>{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export default Card
