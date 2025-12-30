import { useEffect, useState } from 'react'

/**
 * Hook for managing NumberTicker animations
 * Handles value changes and provides smooth transitions
 */
export function useNumberTicker(
  initialValue: number,
  options: {
    duration?: number
    format?: (value: number) => string
  } = {}
) {
  const { duration = 600, format = (val) => val.toLocaleString() } = options
  const [currentValue, setCurrentValue] = useState(initialValue)
  const [isAnimating, setIsAnimating] = useState(false)

  const updateValue = (newValue: number) => {
    if (newValue !== currentValue) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentValue(newValue)
        setIsAnimating(false)
      }, duration / 2) // Start changing halfway through animation
    }
  }

  useEffect(() => {
    setCurrentValue(initialValue)
  }, [initialValue])

  return {
    value: currentValue,
    formattedValue: format(currentValue),
    isAnimating,
    updateValue,
    duration,
    format
  }
}