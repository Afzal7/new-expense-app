/**
 * API transformation utilities for Expense data
 * Handles conversion between database models and API responses
 * Eliminates repetitive field mapping with clean destructuring patterns
 */

import type { AuditEntry, Expense, LineItem } from "@/types/expense";
import { normalizeExpenseCategory } from "@/lib/constants/categories";

type DatabaseExpense = InstanceType<
  typeof import("@/lib/models/expense").Expense
>;

/** Only persist URLs we can load from storage (drops `blob:` previews and invalid values). */
export function filterPersistableAttachmentUrls(urls: string[] | undefined): string[] {
  if (!urls?.length) {
    return [];
  }
  return urls.filter(
    (u) => typeof u === "string" && /^https?:\/\//i.test(u.trim())
  );
}

function toPositiveLineAmount(amount: unknown): number {
  if (typeof amount === "number" && Number.isFinite(amount) && amount > 0) {
    return amount;
  }
  if (typeof amount === "string" && amount.trim() !== "") {
    const n = Number(amount);
    if (Number.isFinite(n) && n > 0) {
      return n;
    }
  }
  // Zod-validated payloads should never hit this; keeps save resilient if called elsewhere.
  return 0.01;
}

function parseLineItemDateForStorage(dateRaw: string | undefined): Date {
  if (dateRaw === undefined || String(dateRaw).trim() === "") {
    return new Date();
  }
  const d = new Date(dateRaw);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

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
  date?: string;
  description?: string;
  category?: string;
  attachments?: string[];
}) {
  return {
    amount: toPositiveLineAmount(item.amount),
    date: parseLineItemDateForStorage(item.date),
    description: item.description,
    category: normalizeExpenseCategory(item.category),
    attachments: filterPersistableAttachmentUrls(item.attachments),
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
