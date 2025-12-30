'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface PulseFeedbackProps {
  children: ReactNode
  className?: string
  duration?: number
}

/**
 * PulseFeedback - Subtle pulse animations for form completions and saves
 *
 * Provides gentle opacity pulse effects for success states
 * Respects prefers-reduced-motion accessibility setting
 */
export function PulseFeedback({
  children,
  className,
  duration = 0.8
}: PulseFeedbackProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.7 }}
      animate={{
        opacity: [0.7, 1, 0.9, 1]
      }}
      transition={{
        duration,
        ease: 'easeInOut',
        times: [0, 0.4, 0.7, 1]
      }}
      style={{
        willChange: 'opacity' // GPU acceleration hint
      }}
    >
      {children}
    </motion.div>
  )
}