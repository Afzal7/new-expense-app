// Expense states enum - extracted to avoid mongoose import in client components
export const EXPENSE_STATES = {
  DRAFT: "Draft",
  PRE_APPROVAL_PENDING: "Pre-Approval Pending",
  PRE_APPROVED: "Pre-Approved",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REIMBURSED: "Reimbursed",
} as const;

export type ExpenseState = (typeof EXPENSE_STATES)[keyof typeof EXPENSE_STATES];
