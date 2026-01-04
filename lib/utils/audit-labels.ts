/**
 * Map audit log actions to human-readable labels
 * Add new action labels here as they are introduced
 */

const ACTION_LABELS: Record<string, string> = {
  created: "Expense Draft Created",
  submitted: "Submitted for Approval",
  "submitted-for-pre-approval": "Submitted for Pre-Approval",
  "submitted-for-final-approval": "Submitted for Final Approval",
  approved: "Approved by Manager",
  "pre-approved": "Pre-Approved by Manager",
  rejected: "Rejected by Manager",
  reimbursed: "Marked as Reimbursed",
  deleted: "Deleted",
  restored: "Restored",
  updated: "Updated",
} as const;

/**
 * Get human-readable label for an audit log action
 */
export function getAuditActionLabel(action: string): string {
  // Try exact match first
  if (ACTION_LABELS[action]) {
    return ACTION_LABELS[action];
  }

  // Fallback to title case with hyphens replaced by spaces
  return action.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
