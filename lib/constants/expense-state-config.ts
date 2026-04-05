/**
 * Expense State Configuration
 * Maps expense states to UI presentation properties (icons, colors, labels)
 * Uses EXPENSE_STATES enum values and lucide-react icons
 */

import {
  Lock,
  Clock,
  ThumbsUp,
  Check,
  X,
  Banknote,
  type LucideIcon,
} from "lucide-react";
import { EXPENSE_STATES, type ExpenseState } from "./expense-states";

export interface StateConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  description: string;
}

/**
 * Maps database ENUM states to UI presentation logic.
 *
 * DESIGN DECISIONS:
 * - Pre-approval Flow: Uses Blue/Indigo to signify "Planning" (Cool colors).
 * - Reimbursement Flow: Uses Orange (Pending) -> Lime (Approved) -> Blue (Paid).
 * - Terminal States: 'Reimbursed' is Blue because it signifies money transfer (Banking).
 */
export const STATE_CONFIG: Record<ExpenseState, StateConfig> = {
  [EXPENSE_STATES.DRAFT]: {
    label: "Draft",
    icon: Lock,
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    description: "Visible only to employee",
  },
  [EXPENSE_STATES.PRE_APPROVAL_PENDING]: {
    label: "Pre-Approval Pending",
    icon: Clock,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    description: "Waiting for manager permission",
  },
  [EXPENSE_STATES.PRE_APPROVED]: {
    label: "Pre-Approved",
    icon: ThumbsUp,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    border: "border-indigo-200",
    description: "Expense is greenlit",
  },
  [EXPENSE_STATES.APPROVAL_PENDING]: {
    label: "Approval Pending",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-200",
    description: "Waiting for final review",
  },
  [EXPENSE_STATES.APPROVED]: {
    label: "Approved",
    icon: Check,
    color: "text-[#121110]",
    bg: "bg-[#D0FC42]",
    border: "border-[#B8E630]",
    description: "Ready for payment",
  },
  [EXPENSE_STATES.REJECTED]: {
    label: "Rejected",
    icon: X,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    description: "Returned to employee",
  },
  [EXPENSE_STATES.REIMBURSED]: {
    label: "Reimbursed",
    icon: Banknote,
    color: "text-blue-700",
    bg: "bg-blue-100",
    border: "border-blue-200",
    description: "Payment processed",
  },
};

/**
 * Get state configuration for a given expense state
 */
export function getStateConfig(state: ExpenseState): StateConfig {
  return STATE_CONFIG[state] || STATE_CONFIG[EXPENSE_STATES.DRAFT];
}
