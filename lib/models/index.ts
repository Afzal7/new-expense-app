/**
 * Mongoose Models Definition
 *
 * This file will store the application-specific models (e.g. Projects, Tasks).
 * Better Auth models (User, Session, Account) are managed automatically by the adapter
 * and should NOT be defined here to avoid conflicts.
 */

// Re-export Expense-related types and model from separate file
import { EXPENSE_STATES, ExpenseState, Expense } from "./expense";

export { EXPENSE_STATES, Expense };
export type { ExpenseState };
