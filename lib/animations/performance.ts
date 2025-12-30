'use client'

import { useReducedMotion } from 'framer-motion'
import { useMemo } from 'react';
// Removed unused motion import
// Removed unused React import

/**
 * Performance optimization utilities for animations
 */

/**
 * Hook that provides animation performance optimizations
 */
export function useAnimationPerformance() {
  const shouldReduceMotion = useReducedMotion()

  return useMemo(() => ({
    shouldReduceMotion,

    // GPU acceleration hints
    gpuAcceleration: {
      willChange: 'transform, opacity' as const,
      transform: 'translateZ(0)' as const, // Force GPU layer
    },

    // Reduced motion alternatives
    reducedMotion: {
      duration: 0.1,
      ease: 'linear' as const,
    },

    // Standard animation config
    standard: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },

    // Spring config for natural motion
    spring: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 120,
    }
  }), [shouldReduceMotion])
}

// Note: Higher-order component removed due to complexity
// Use the hooks directly for performance optimizations

/**
 * Hook for layout animations with performance optimization
 */
export function useLayoutAnimation() {
  const perf = useAnimationPerformance()

  return useMemo(() => ({
    layout: true,
    layoutId: (id: string) => id,

    // Transition config that respects reduced motion
    transition: perf.shouldReduceMotion
      ? perf.reducedMotion
      : perf.standard,

    // Spring config for layout changes
    springTransition: perf.shouldReduceMotion
      ? perf.reducedMotion
      : perf.spring,
  }), [perf])
}

/**
 * Hook for staggered animations with performance considerations
 */
export function useStaggeredAnimation(itemCount: number, baseDelay = 0.05) {
  const perf = useAnimationPerformance()

  return useMemo(() => {
    const staggerDelay = perf.shouldReduceMotion ? 0 : baseDelay

    return {
      container: {
        initial: 'hidden',
        animate: 'visible',
        variants: {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: staggerDelay
            }
          }
        }
      },

      item: {
        variants: {
          hidden: { opacity: 0, y: perf.shouldReduceMotion ? 0 : 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: perf.shouldReduceMotion
              ? perf.reducedMotion
              : perf.standard
          }
        }
      }
    }
  }, [baseDelay, perf])
}