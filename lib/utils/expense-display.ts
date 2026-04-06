/**
 * Utility functions for displaying expense information in the UI
 */

import type { Expense } from "@/types/expense";

/**
 * Get merchant/description from expense line items
 * Priority: first line item description > category > fallback
 */
export function getExpenseMerchant(expense: Expense): string {
  // Safety check for empty line items
  if (!expense.lineItems || expense.lineItems.length === 0) {
    return `Expense #${expense.id.slice(-8)}`;
  }

  const firstItem = expense.lineItems[0];
  
  if (firstItem?.description) {
    return firstItem.description;
  }

  // Fall back to categories if available
  const categories = expense.lineItems
    .map((item) => item.category)
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index); // unique

  if (categories.length > 0) {
    return categories.join(", ");
  }

  // Final fallback
  return `Expense #${expense.id.slice(-8)}`;
}

/**
 * Get primary category from expense line items
 */
export function getExpenseCategory(expense: Expense): string {
  if (!expense.lineItems || expense.lineItems.length === 0) {
    return "Others";
  }
  const firstItem = expense.lineItems[0];
  return firstItem?.category || "Others";
}

/**
 * Check if expense is private (no organization/manager assigned)
 */
export function isPrivateExpense(expense: Expense): boolean {
  const noOrg = expense.organizationId == null;
  const noManagers = (expense.managerIds?.length ?? 0) === 0;
  return noOrg && noManagers;
}
