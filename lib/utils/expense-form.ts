/**
 * Utility functions for expense form operations
 * Contains data transformation, business logic, and helper functions
 */

import type { Expense, ExpenseInput, LineItemInput } from "@/types/expense";
import type { ExpenseSubmissionStatus } from "@/lib/constants/expense-states";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";

// Types for form operations
export type ExpenseFormMode = "create" | "edit";
export type ExpenseSubmissionType = "draft" | "pre-approval" | "final-approval";

export interface FormLineItem {
  amount?: number;
  date: string;
  description?: string;
  category?: string;
  attachments?: string[];
}

export interface ExpenseFormData {
  totalAmount?: number;
  managerIds?: string[];
  lineItems?: FormLineItem[];
}

/**
 * Converts submission status to proper expense state
 */
export function submissionStatusToExpenseState(
  status: ExpenseSubmissionStatus
): string {
  switch (status) {
    case "pre-approval":
      return EXPENSE_STATES.PRE_APPROVAL_PENDING;
    case "approval-pending":
      return EXPENSE_STATES.APPROVAL_PENDING;
    default:
      return EXPENSE_STATES.DRAFT;
  }
}

/**
 * Transforms form data to ExpenseInput for API submission
 */
export function transformFormDataToExpenseInput(
  formData: ExpenseFormData,
  status?: ExpenseSubmissionStatus
): ExpenseInput {
  const baseInput = {
    totalAmount: formData.totalAmount || 0,
    managerIds: formData.managerIds || [],
    lineItems: (formData.lineItems || []).map(transformLineItem),
  };

  if (!status) {
    // Return draft input (no status)
    return baseInput as ExpenseInput;
  }

  // Return submission input with proper status
  return {
    ...baseInput,
    status: submissionStatusToExpenseState(status),
  } as ExpenseInput;
}

/**
 * Transforms a single line item from form format to API format
 */
export function transformLineItem(item: FormLineItem): LineItemInput {
  return {
    amount: item.amount || 0,
    date: new Date(item.date),
    description: item.description || "",
    category: item.category || "",
    attachments: item.attachments || [],
  };
}

/**
 * Calculates the total amount from line items
 */
export function calculateLineItemsTotal(lineItems: FormLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
}

/**
 * Creates a new line item with default values
 */
export function createDefaultLineItem(): FormLineItem {
  return {
    amount: undefined,
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "",
    attachments: [],
  };
}

/**
 * Checks if the form has any line items
 */
export function hasLineItems(formData: ExpenseFormData): boolean {
  return (formData.lineItems || []).length > 0;
}

/**
 * Determines if an expense is in draft state
 */
export function isDraftExpense(expense?: Expense): boolean {
  if (!expense) return true; // New expenses are drafts by default
  return expense.state === "Draft";
}

/**
 * Checks if the total amount matches the calculated total from line items
 */
export function totalsMatch(
  manualTotal: number,
  calculatedTotal: number
): boolean {
  return Math.abs(manualTotal - calculatedTotal) < 0.01; // Account for floating point precision
}

/**
 * Formats a number as currency string
 */
export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}
