import { useEffect, useEffectEvent } from 'react'

interface UsePollingOptions {
  enabled: boolean
  intervalMs: number
  callback: () => void
}

export function usePolling({ enabled, intervalMs, callback }: UsePollingOptions) {
  const onTick = useEffectEvent(callback)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      onTick()
    }, intervalMs)

    return () => {
      window.clearInterval(timerId)
    }
  }, [enabled, intervalMs])
}
