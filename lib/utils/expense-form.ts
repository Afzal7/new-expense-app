/**
 * Utility functions for expense form operations
 * Contains data transformation, business logic, and helper functions
 */

import type { Expense } from "@/types/expense";
import type {
  ExpenseCreatePayload,
  ExpenseFormData,
  FormLineItemInput,
} from "@/lib/validations/expense";
import type { ExpenseSubmissionStatus } from "@/lib/constants/expense-states";
import { normalizeExpenseCategory } from "@/lib/constants/categories";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";

// Types for form operations
export type { ExpenseFormData, FormLineItemInput } from "@/lib/validations/expense";
export type ExpenseFormMode = "create" | "edit";
export type ExpenseSubmissionType = "draft" | "pre-approval" | "final-approval";

/** One line item while editing (Zod input: amounts may be empty until validated). */
export type FormLineItem = NonNullable<ExpenseFormData["lineItems"]>[number];

/**
 * Parses a line item amount for summing / API transform (number, string from API, empty).
 */
export function lineItemAmountToNumber(amount: FormLineItem["amount"]): number {
  if (amount === undefined || amount === null) {
    return 0;
  }
  if (typeof amount === "number") {
    return Number.isFinite(amount) ? amount : 0;
  }
  const n = Number(amount);
  return Number.isFinite(n) ? n : 0;
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
 * Transforms form data to API JSON for POST `/api/expenses`
 */
export function transformFormDataToExpenseInput(
  formData: ExpenseFormData,
  status?: ExpenseSubmissionStatus
): ExpenseCreatePayload {
  const baseInput = {
    totalAmount: formData.totalAmount ?? 0,
    managerIds: formData.managerIds ?? [],
    lineItems: (formData.lineItems ?? []).map(transformLineItem),
  };

  if (!status) {
    return baseInput as ExpenseCreatePayload;
  }

  return {
    ...baseInput,
    status: submissionStatusToExpenseState(status),
  } as ExpenseCreatePayload;
}

/**
 * Transforms a single line item from form format to API format
 */
export function transformLineItem(item: FormLineItem): FormLineItemInput {
  const dateStr =
    item.date && String(item.date).trim() !== ""
      ? String(item.date)
      : new Date().toISOString().split("T")[0];
  return {
    amount: lineItemAmountToNumber(item.amount),
    date: dateStr,
    description: item.description || "",
    category: normalizeExpenseCategory(item.category),
    attachments: item.attachments || [],
  } as FormLineItemInput;
}

/**
 * Calculates the total amount from line items
 */
export function calculateLineItemsTotal(lineItems: FormLineItem[]): number {
  return lineItems.reduce(
    (sum, item) => sum + lineItemAmountToNumber(item.amount),
    0
  );
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
