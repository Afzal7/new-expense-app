/**
 * Pure business logic functions for expense operations
 * Contains rules, calculations, and validations that don't depend on React state
 */

import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import type { Expense } from "@/types/expense";
import type { FormLineItem } from "@/lib/utils/expense-form";

/**
 * Business rules for expense operations
 */
export const ExpenseBusinessRules = {
  /**
   * Determines if an expense can be submitted for pre-approval
   */
  canSubmitForPreApproval: (
    expense: Expense | null,
    _userRole?: string
  ): boolean => {
    if (!expense) return true; // New expenses can always be submitted

    return (
      expense.state === EXPENSE_STATES.DRAFT ||
      expense.state === EXPENSE_STATES.REJECTED
    );
  },

  /**
   * Determines if an expense can be submitted for final approval
   */
  canSubmitForFinalApproval: (
    expense: Expense | null,
    _userRole?: string
  ): boolean => {
    if (!expense) return true; // New expenses can always be submitted

    return (
      expense.state === EXPENSE_STATES.DRAFT ||
      expense.state === EXPENSE_STATES.PRE_APPROVED ||
      expense.state === EXPENSE_STATES.REJECTED
    );
  },

  /**
   * Determines if an expense can be edited
   */
  canEditExpense: (expense: Expense, _userRole?: string): boolean => {
    // Cannot edit approved or reimbursed expenses
    return (
      expense.state !== EXPENSE_STATES.APPROVED &&
      expense.state !== EXPENSE_STATES.REIMBURSED
    );
  },

  /**
   * Determines if an expense total amount can be modified
   */
  canModifyTotalAmount: (expense?: Expense): boolean => {
    if (!expense) return true; // New expenses can always be modified

    // Cannot modify total for pre-approved or approved expenses
    return (
      expense.state !== EXPENSE_STATES.PRE_APPROVED &&
      expense.state !== EXPENSE_STATES.APPROVED
    );
  },

  /**
   * Determines if line items can be modified
   */
  canModifyLineItems: (expense?: Expense): boolean => {
    if (!expense) return true; // New expenses can always be modified

    // Cannot modify line items for approved expenses
    return expense.state !== EXPENSE_STATES.APPROVED;
  },

  /**
   * Calculates the total amount from line items
   */
  calculateTotalFromLineItems: (lineItems: FormLineItem[]): number => {
    return lineItems.reduce((total, item) => {
      return total + (item.amount || 0);
    }, 0);
  },

  /**
   * Validates if the manual total matches the calculated total
   */
  validateTotalConsistency: (
    manualTotal: number,
    calculatedTotal: number,
    tolerance: number = 0.01
  ): boolean => {
    return Math.abs(manualTotal - calculatedTotal) < tolerance;
  },

  /**
   * Determines the next state after submission
   */
  getNextStateAfterSubmission: (
    currentState: string,
    submissionType: "pre-approval" | "final-approval"
  ): string => {
    switch (submissionType) {
      case "pre-approval":
        return EXPENSE_STATES.PRE_APPROVAL_PENDING;
      case "final-approval":
        return EXPENSE_STATES.APPROVAL_PENDING;
      default:
        return currentState;
    }
  },

  /**
   * Checks if an expense requires manager approval
   */
  requiresManagerApproval: (expense: Expense): boolean => {
    return (expense.managerIds || []).length > 0;
  },

  /**
   * Validates if a state transition is allowed
   */
  canTransitionToState: (
    currentState: string,
    targetState: string,
    userId?: string,
    managerIds?: string[]
  ): boolean => {
    // Check if user is authorized for the transition
    const isAssignedManager = !!(userId && managerIds?.includes(userId));

    switch (targetState) {
      case EXPENSE_STATES.PRE_APPROVAL_PENDING:
        return (
          currentState === EXPENSE_STATES.DRAFT ||
          currentState === EXPENSE_STATES.REJECTED
        );

      case EXPENSE_STATES.PRE_APPROVED:
        return (
          currentState === EXPENSE_STATES.PRE_APPROVAL_PENDING &&
          isAssignedManager
        );

      case EXPENSE_STATES.APPROVAL_PENDING:
        return (
          currentState === EXPENSE_STATES.DRAFT ||
          currentState === EXPENSE_STATES.PRE_APPROVED ||
          currentState === EXPENSE_STATES.REJECTED
        );

      case EXPENSE_STATES.APPROVED:
        return (
          currentState === EXPENSE_STATES.APPROVAL_PENDING && isAssignedManager
        );

      case EXPENSE_STATES.REIMBURSED:
        return currentState === EXPENSE_STATES.APPROVED;

      case EXPENSE_STATES.REJECTED:
        return (
          (currentState === EXPENSE_STATES.PRE_APPROVAL_PENDING ||
            currentState === EXPENSE_STATES.PRE_APPROVED ||
            currentState === EXPENSE_STATES.APPROVAL_PENDING) &&
          isAssignedManager
        );

      default:
        return false;
    }
  },

  /**
   * Gets valid next states for a given current state and user
   */
  getValidNextStates: (
    currentState: string,
    userId?: string,
    managerIds?: string[]
  ): string[] => {
    const allStates = Object.values(EXPENSE_STATES);
    return allStates.filter((state) =>
      ExpenseBusinessRules.canTransitionToState(
        currentState,
        state,
        userId,
        managerIds
      )
    );
  },

  /**
   * Gets the appropriate badge variant for expense state
   */
  getExpenseStateBadgeVariant: (
    state: string
  ): "default" | "secondary" | "destructive" => {
    switch (state) {
      case EXPENSE_STATES.APPROVED:
        return "default";
      case EXPENSE_STATES.REJECTED:
        return "destructive";
      default:
        return "secondary";
    }
  },

  /**
   * Formats expense amount for display
   */
  formatExpenseAmount: (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  },

  /**
   * Generates a title for an expense based on its line items
   */
  generateExpenseTitle: (expense: Expense): string => {
    if (expense.lineItems.length === 0) {
      return `Expense #${expense.id.slice(-8)}`;
    }

    // Try to get a meaningful title from the first line item description
    const firstItem = expense.lineItems[0];
    if (firstItem.description && firstItem.description.trim()) {
      const description = firstItem.description.trim();
      return description.length > 50
        ? `${description.substring(0, 50)}...`
        : description;
    }

    // Fall back to categories
    const categories = expense.lineItems
      .map((item) => item.category)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index); // unique

    if (categories.length > 0) {
      return categories.join(", ");
    }

    // Final fallback
    return `Expense #${expense.id.slice(-8)}`;
  },
};

/**
 * Validation rules for expense data
 */
export const ExpenseValidationRules = {
  /**
   * Validates that an expense has required fields for submission
   */
  validateForSubmission: (
    totalAmount: number,
    managerIds: string[],
    lineItems: FormLineItem[]
  ) => {
    const errors: string[] = [];

    if (totalAmount <= 0) {
      errors.push("Total amount must be greater than 0");
    }

    if (managerIds.length === 0) {
      errors.push("At least one manager must be selected");
    }

    if (lineItems.length === 0) {
      errors.push("At least one line item is required");
    }

    // Validate line items
    lineItems.forEach((item, index) => {
      if (!item.amount || item.amount <= 0) {
        errors.push(`Line item ${index + 1}: Amount must be greater than 0`);
      }

      if (!item.date) {
        errors.push(`Line item ${index + 1}: Date is required`);
      } else {
        const itemDate = new Date(item.date);
        if (itemDate > new Date()) {
          errors.push(`Line item ${index + 1}: Date cannot be in the future`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validates a single line item
   */
  validateLineItem: (item: FormLineItem) => {
    const errors: string[] = [];

    if (item.amount !== undefined && item.amount < 0) {
      errors.push("Amount cannot be negative");
    }

    if (item.date) {
      const date = new Date(item.date);
      if (date > new Date()) {
        errors.push("Date cannot be in the future");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
