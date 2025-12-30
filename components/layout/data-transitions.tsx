'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
// Removed unused Skeleton import

interface LoadingOverlayProps {
  isLoading: boolean
  children: ReactNode
  className?: string
}

/**
 * Loading overlay for data refresh animations
 * Shows shimmer effect during data updates
 */
export function LoadingOverlay({ isLoading, children, className }: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { duration: 0.2 }
              }}
              className="bg-card border rounded-lg p-4 shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                />
                <span className="text-sm text-muted-foreground">Updating...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Content fade-in animation for data updates
 */
export function ContentFadeIn({ children, key }: { children: ReactNode; key?: string | number }) {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Shimmer effect for content areas during loading
 */
export function ShimmerEffect({
  className,
  lines = 3
}: {
  className?: string
  lines?: number
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-muted rounded"
          animate={{
            background: [
              "hsl(var(--muted))",
              "hsl(var(--muted-foreground) / 0.1)",
              "hsl(var(--muted))"
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  )
}