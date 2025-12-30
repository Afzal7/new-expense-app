import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean
}

function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  if (animate) {
    return (
      <div
        data-slot="skeleton"
        className={cn("relative overflow-hidden rounded-md bg-muted", className)}
        {...props}
      >
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"
          animate={{
            translateX: ["0%", "100%"]
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5
          }}
        />
      </div>
    )
  }

  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted rounded-md", className)}
      {...props}
    />
  )
}

/**
 * Skeleton for text content with multiple lines
 */
function SkeletonText({
  lines = 3,
  className,
  animate = true
}: { lines?: number } & SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 && "w-3/4" // Last line shorter
          )}
          animate={animate}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton for circular avatars
 */
function SkeletonCircle({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("rounded-full", className)}
      animate={animate}
      {...props}
    />
  )
}

/**
 * Skeleton for buttons
 */
function SkeletonButton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-10", className)}
      animate={animate}
      {...props}
    />
  )
}

export { Skeleton, SkeletonText, SkeletonCircle, SkeletonButton }
