import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[linear-gradient(90deg,rgba(226,232,240,0.8),rgba(241,245,249,0.95),rgba(226,232,240,0.8))] bg-[length:200%_100%] animate-shimmer',
        className,
      )}
    />
  )
}

export default Skeleton
