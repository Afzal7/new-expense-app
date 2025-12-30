'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface SuccessGlowProps {
  children: ReactNode
  className?: string
  trigger?: boolean
  intensity?: 'subtle' | 'medium' | 'strong'
}

/**
 * SuccessGlow - Reusable emerald aura provider for successful state transitions
 *
 * Provides a subtle emerald glow effect using box-shadow animation
 * Respects prefers-reduced-motion accessibility setting
 */
export function SuccessGlow({ children, className, trigger = false, intensity = 'medium' }: SuccessGlowProps) {
  const shouldReduceMotion = useReducedMotion()

  const glowIntensity = {
    subtle: '0 0 10px rgba(16, 185, 129, 0.3)',
    medium: '0 0 15px rgba(16, 185, 129, 0.5)',
    strong: '0 0 20px rgba(16, 185, 129, 0.7)'
  };

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
      animate={trigger ? {
        boxShadow: glowIntensity[intensity]
      } : {
        boxShadow: '0 0 0px rgba(16, 185, 129, 0)'
      }}
      transition={{
        duration: 0.5,
        ease: 'easeOut'
      }}
      style={{
        borderRadius: 'inherit',
        willChange: 'box-shadow' // GPU acceleration hint
      }}
    >
      {children}
    </motion.div>
  )
}