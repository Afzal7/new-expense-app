/**
 * Base TypeScript interfaces for Expense-related entities
 * Based on Mongoose schema in lib/models.ts and API contracts in specs/001-expense-app-mvp/contracts/expenses-api.yaml
 */

import type { ExpenseState } from "../lib/models";

/**
 * Line Item interface (API response format)
 */
export interface LineItem {
  amount: number;
  date: string; // ISO date string from API
  description?: string;
  category?: string;
  attachments: string[];
}

/**
 * Audit Entry interface (API response format)
 */
export interface AuditEntry {
  action: string;
  date: string; // ISO date string from API
  actorId: string;
  previousValues?: Record<string, unknown>;
  updatedValues?: Record<string, unknown>;
}

/**
 * Expense interface (API response format)
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
  createdAt: string; // ISO date string from API
  updatedAt: string; // ISO date string from API
  deletedAt: string | null; // ISO date string from API
}

/**
 * Line Item Input interface for creating/updating
 */
export interface LineItemInput {
  amount: number;
  date: Date;
  description?: string;
  category?: string;
  attachments: string[];
}

/**
 * Expense Input interface for creating/updating expenses
 */
export interface ExpenseInput {
  totalAmount: number;
  managerIds: string[];
  lineItems: LineItemInput[];
  status?: "draft" | "pre-approval" | "approval-pending" | "approved";
}

/**
 * Expense State type (re-exported for convenience)
 */
export type { ExpenseState } from "../lib/models";
