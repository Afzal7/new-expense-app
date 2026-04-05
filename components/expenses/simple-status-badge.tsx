"use client";

import type { ExpenseState } from "@/lib/constants/expense-states";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";

interface SimpleStatusBadgeProps {
  state: ExpenseState;
  className?: string;
}

/**
 * Simple status badge matching the template design
 * Maps expense states to simpler display names and colors
 */
export function SimpleStatusBadge({
  state,
  className = "",
}: SimpleStatusBadgeProps) {
  // Map expense states to template status names
  const getStatusKey = (state: ExpenseState): string => {
    if (state === EXPENSE_STATES.DRAFT) return "draft";
    if (
      state === EXPENSE_STATES.PRE_APPROVAL_PENDING ||
      state === EXPENSE_STATES.APPROVAL_PENDING
    )
      return "pending";
    if (state === EXPENSE_STATES.APPROVED || state === EXPENSE_STATES.PRE_APPROVED)
      return "approved";
    if (state === EXPENSE_STATES.REJECTED) return "rejected";
    if (state === EXPENSE_STATES.REIMBURSED) return "reimbursed";
    return "draft";
  };

  const statusKey = getStatusKey(state);

  const styles: Record<string, string> = {
    draft: "bg-zinc-100 text-zinc-500",
    pending: "bg-orange-100 text-orange-700",
    approved: "bg-[#D0FC42] text-[#121110]",
    rejected: "bg-red-100 text-red-700",
    reimbursed: "bg-blue-100 text-blue-700",
  };

  const displayText: Record<string, string> = {
    draft: "draft",
    pending: "pending",
    approved: "approved",
    rejected: "rejected",
    reimbursed: "reimbursed",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[statusKey]} ${className}`}
    >
      {displayText[statusKey]}
    </span>
  );
}
