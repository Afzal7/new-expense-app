'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface SuccessGlowProps {
  children: ReactNode
  className?: string
}

/**
 * SuccessGlow - Reusable emerald aura provider for successful state transitions
 *
 * Provides a subtle emerald glow effect using box-shadow animation
 * Respects prefers-reduced-motion accessibility setting
 */
export function SuccessGlow({ children, className }: SuccessGlowProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={className} style={{ borderRadius: 'inherit' }}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={{ scale: 1, filter: 'brightness(1)' }}
      animate={{
        scale: [1, 1.02, 1.01, 1],
        filter: [
          'brightness(1)',
          'brightness(1.1)',
          'brightness(1.05)',
          'brightness(1)'
        ]
      }}
      transition={{
        duration: 1.2,
        ease: 'easeInOut',
        times: [0, 0.3, 0.7, 1]
      }}
      style={{
        borderRadius: 'inherit',
        willChange: 'transform, filter' // GPU acceleration hint
      }}
    >
      {children}
    </motion.div>
  )
}