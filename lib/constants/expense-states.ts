// Expense states enum - extracted to avoid mongoose import in client components
export const EXPENSE_STATES = {
  DRAFT: "Draft",
  PRE_APPROVAL_PENDING: "Pre-Approval Pending",
  PRE_APPROVED: "Pre-Approved",
  APPROVAL_PENDING: "Approval Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REIMBURSED: "Reimbursed",
} as const;

export type ExpenseState = (typeof EXPENSE_STATES)[keyof typeof EXPENSE_STATES];

// Submission statuses for API operations
export const EXPENSE_SUBMISSION_STATUSES = {
  PRE_APPROVAL: "pre-approval",
  APPROVAL_PENDING: "approval-pending",
} as const;

export type ExpenseSubmissionStatus =
  (typeof EXPENSE_SUBMISSION_STATUSES)[keyof typeof EXPENSE_SUBMISSION_STATUSES];
