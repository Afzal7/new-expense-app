'use client';

import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface PulseFeedbackProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
  onComplete?: () => void;
}

export function PulseFeedback({
  children,
  trigger,
  className,
  onComplete
}: PulseFeedbackProps) {
  return (
    <motion.div
      className={cn('relative', className)}
      animate={trigger ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(59, 130, 246, 0)',
          '0 0 0 4px rgba(59, 130, 246, 0.3)',
          '0 0 0 0 rgba(59, 130, 246, 0)'
        ]
      } : {}}
      transition={{
        duration: 0.6,
        ease: 'easeOut'
      }}
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.div>
  );
}