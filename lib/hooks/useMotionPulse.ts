import { useCallback, useState } from 'react'

/**
 * Hook for programmatic control of MotionPulse animations
 * Provides methods to trigger pulse animations on demand
 */
export function useMotionPulse() {
  const [isPulsing, setIsPulsing] = useState(false)

  const triggerPulse = useCallback((duration = 800) => {
    setIsPulsing(true)
    setTimeout(() => setIsPulsing(false), duration)
  }, [])

  const triggerPulseAsync = useCallback((duration = 800) => {
    return new Promise<void>((resolve) => {
      setIsPulsing(true)
      setTimeout(() => {
        setIsPulsing(false)
        resolve()
      }, duration)
    })
  }, [])

  return {
    isPulsing,
    triggerPulse,
    triggerPulseAsync
  }
}