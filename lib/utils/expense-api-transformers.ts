/**
 * API transformation utilities for Expense data
 * Handles conversion between database models and API responses
 * Eliminates repetitive field mapping with clean destructuring patterns
 */

import type { AuditEntry, Expense, LineItem } from "@/types/expense";

type DatabaseExpense = InstanceType<
  typeof import("@/lib/models/expense").Expense
>;

/**
 * Transforms an array of database expenses to API format
 */
export function transformExpensesToApiResponse(
  expenses: DatabaseExpense[]
): Expense[] {
  return expenses.map(transformExpenseToApiResponse);
}

/**
 * Transforms a database Expense model to API response format
 * Eliminates field-by-field repetition by using destructuring and spread
 */
export function transformExpenseToApiResponse(
  expense: DatabaseExpense
): Expense {
  // Direct field copies - no repetition of field names
  const { userId, organizationId, managerIds, totalAmount, state } = expense;

  return {
    // Spread direct copies - no manual repetition of "field: field"
    userId,
    organizationId,
    managerIds,
    totalAmount,
    state,

    // Computed/transformed fields
    id: expense._id.toString(),
    lineItems: expense.lineItems.map(transformLineItemToApi),
    auditLog: expense.auditLog.map(transformAuditEntryToApi),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
    deletedAt: expense.deletedAt?.toISOString() || null,
  };
}

/**
 * Transforms a database LineItem to API format
 */
export function transformLineItemToApi(item: {
  amount: number;
  date: Date;
  description?: string;
  category?: string;
  attachments: string[];
}): LineItem {
  return {
    amount: item.amount,
    date: item.date.toISOString(),
    description: item.description,
    category: item.category,
    attachments: item.attachments,
  };
}

/**
 * Transforms a database AuditEntry to API format
 */
export function transformAuditEntryToApi(entry: {
  action: string;
  date: Date;
  actorId: string;
  previousValues?: Record<string, unknown>;
  updatedValues?: Record<string, unknown>;
}): AuditEntry {
  return {
    ...entry,
    date: entry.date.toISOString(),
  };
}

/**
 * Transforms form LineItem data to database format
 */
export function transformLineItemToDatabase(item: {
  amount?: number;
  date: string;
  description?: string;
  category?: string;
  attachments?: string[];
}) {
  return {
    amount: item.amount || 0,
    date: new Date(item.date),
    description: item.description,
    category: item.category,
    attachments: item.attachments || [],
  };
}

/**
 * Transforms an array of form LineItems to database format
 */
export function transformLineItemsToDatabase(
  lineItems: Array<{
    amount?: number;
    date: string;
    description?: string;
    category?: string;
    attachments?: string[];
  }>
) {
  return lineItems.map(transformLineItemToDatabase);
}

/**
 * Creates a snapshot of line items for audit logging
 */
export function createLineItemsSnapshot(
  lineItems: Array<{
    amount: number;
    date: Date;
    description?: string;
    category?: string;
    attachments: string[];
  }>
): Array<{
  amount: number;
  date: string;
  description?: string;
  category?: string;
  attachments: string[];
}> {
  return lineItems.map((item) => ({
    amount: item.amount,
    date: item.date.toISOString(),
    description: item.description,
    category: item.category,
    attachments: [...item.attachments],
  }));
}
