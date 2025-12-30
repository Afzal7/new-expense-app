import { useCallback, useState } from 'react'

/**
 * Hook for consistent success feedback animations
 * Provides methods to trigger SuccessGlow animations on demand
 */
export function useSuccessGlow() {
  const [isGlowing, setIsGlowing] = useState(false)

  const triggerGlow = useCallback((duration = 1200) => {
    setIsGlowing(true)
    setTimeout(() => setIsGlowing(false), duration)
  }, [])

  const triggerGlowAsync = useCallback((duration = 1200) => {
    return new Promise<void>((resolve) => {
      setIsGlowing(true)
      setTimeout(() => {
        setIsGlowing(false)
        resolve()
      }, duration)
    })
  }, [])

  return {
    isGlowing,
    triggerGlow,
    triggerGlowAsync
  }
}