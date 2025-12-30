'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionPulseProps {
  children: ReactNode
  className?: string
  intensity?: 'subtle' | 'medium' | 'strong'
  duration?: number
  repeat?: boolean
  error?: boolean
}

/**
 * MotionPulse - Reusable amber pulse for non-blocking validation states
 *
 * Provides repeating scale animations for highlighting form fields
 * Supports different intensity levels and respects accessibility
 */
export function MotionPulse({
  children,
  className,
  intensity = 'subtle',
  duration = 2,
  repeat = true,
  error = false
}: MotionPulseProps) {
  const shouldReduceMotion = useReducedMotion()

  const intensityConfigs = {
    subtle: { scale: [1, 1.02, 1] },
    medium: { scale: [1, 1.05, 1] },
    strong: { scale: [1, 1.08, 1] }
  }

  if (shouldReduceMotion || !error) {
    return (
      <div className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      animate={intensityConfigs[intensity]}
      transition={{
        duration,
        ease: 'easeInOut',
        repeat: repeat ? Infinity : 0,
        repeatType: 'loop'
      }}
      style={{
        transformOrigin: 'center',
        willChange: 'transform' // GPU acceleration hint
      }}
    >
      {children}
    </motion.div>
  )
}