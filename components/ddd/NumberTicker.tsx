'use client'

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface NumberTickerProps {
  value: number
  className?: string
  duration?: number
  format?: (value: number) => string
}

/**
 * NumberTicker - Fluid numeric-flip animation for monetary values and counters
 *
 * Provides smooth number transitions with flip animation effects
 * Respects prefers-reduced-motion accessibility setting
 */
export function NumberTicker({
  value,
  className,
  duration = 0.6,
  format = (val) => val.toLocaleString()
}: NumberTickerProps) {
  const shouldReduceMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(value)
  const [_isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setDisplayValue(value)
        setIsAnimating(false)
      }, duration * 1000 / 2) // Start changing halfway through animation

      return () => clearTimeout(timer)
    }
  }, [value, displayValue, duration])

  if (shouldReduceMotion) {
    return (
      <span className={className}>
        {format(displayValue)}
      </span>
    )
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayValue}
          initial={{ y: 20, opacity: 0, rotateX: -90 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -20, opacity: 0, rotateX: 90 }}
          transition={{
            duration,
            ease: 'easeInOut'
          }}
          className="inline-block"
          style={{
            willChange: 'transform, opacity' // GPU acceleration hint
          }}
        >
          {format(displayValue)}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}