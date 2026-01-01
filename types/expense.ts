/**
 * Base TypeScript interfaces for Expense-related entities
 * Based on Mongoose schema in lib/models.ts and API contracts in specs/001-expense-app-mvp/contracts/expenses-api.yaml
 */

import type { ExpenseState } from "../lib/models";

/**
 * Line Item interface
 */
export interface LineItem {
  amount: number;
  date: Date;
  description?: string;
  category?: string;
  attachments: string[];
}

/**
 * Audit Entry interface
 */
export interface AuditEntry {
  action: string;
  date: Date;
  actorId: string;
  previousValues?: Record<string, unknown>;
  updatedValues?: Record<string, unknown>;
}

/**
 * Expense interface
 */
export interface Expense {
  id: string;
  userId: string;
  organizationId: string | null;
  managerIds: string[];
  totalAmount: number;
  state: ExpenseState;
  lineItems: LineItem[];
  auditLog: AuditEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Line Item Input interface for creating/updating (without attachments)
 */
export interface LineItemInput {
  amount: number;
  date: Date;
  description?: string;
  category?: string;
}

/**
 * Expense Input interface for creating/updating expenses
 */
export interface ExpenseInput {
  totalAmount: number;
  managerIds: string[];
  lineItems: LineItemInput[];
}

/**
 * Expense State type (re-exported for convenience)
 */
export type { ExpenseState } from "../lib/models";
