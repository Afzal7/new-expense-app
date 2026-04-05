"use client";

import { getStateConfig } from "@/lib/constants/expense-state-config";
import type { ExpenseState } from "@/lib/constants/expense-states";

interface StatusBadgeProps {
  state: ExpenseState;
  className?: string;
}

/**
 * StatusBadge: Displays the current state with the appropriate color theme.
 * Used in the Header and Context Bar.
 */
export function StatusBadge({ state, className = "" }: StatusBadgeProps) {
  const config = getStateConfig(state);
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
      {config.label}
    </div>
  );
}
