/**
 * Custom hook for expense form submission logic
 * Encapsulates all submission strategies and business rules
 */

import { useCallback } from "react";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { transformFormDataToExpenseInput } from "@/lib/utils/expense-form";
import type { Expense } from "@/types/expense";
import type { ExpenseSubmissionStatus } from "@/lib/constants/expense-states";
import type { ExpenseFormData } from "@/lib/utils/expense-form";

interface UseExpenseFormSubmissionOptions {
  expenseId?: string;
  onSuccess: (data: Expense) => void;
}

export function useExpenseFormSubmission({
  expenseId,
  onSuccess,
}: UseExpenseFormSubmissionOptions) {
  const { createExpense, updateExpense, submitExpense, approveExpense } =
    useExpenseMutations();

  const isEdit = !!expenseId;

  /**
   * Submits expense as draft (save without approval)
   */
  const submitDraft = useCallback(
    async (formData: ExpenseFormData): Promise<void> => {
      const expenseInput = transformFormDataToExpenseInput(formData);

      if (isEdit) {
        const result = await updateExpense.mutateAsync({
          id: expenseId,
          expenseInput,
        });
        onSuccess(result);
      } else {
        const result = await createExpense.mutateAsync(expenseInput);
        onSuccess(result);
      }
    },
    [createExpense, updateExpense, isEdit, expenseId, onSuccess]
  );

  /**
   * Submits expense for pre-approval
   */
  const submitForPreApproval = useCallback(
    async (formData: ExpenseFormData): Promise<void> => {
      const status: ExpenseSubmissionStatus = "pre-approval";
      const expenseInput = transformFormDataToExpenseInput(formData, status);

      if (isEdit) {
        // For existing expenses, submit for pre-approval
        const result = await submitExpense.mutateAsync(expenseId);
        onSuccess(result);
      } else {
        // For new expenses, create with pre-approval status
        const result = await createExpense.mutateAsync(expenseInput);
        onSuccess(result);
      }
    },
    [createExpense, submitExpense, isEdit, expenseId, onSuccess]
  );

  /**
   * Submits expense for final approval
   */
  const submitForFinalApproval = useCallback(
    async (formData: ExpenseFormData): Promise<void> => {
      const status: ExpenseSubmissionStatus = "approval-pending";
      const expenseInput = transformFormDataToExpenseInput(formData, status);

      if (isEdit) {
        // For existing expenses, submit for pre-approval then approve
        await submitExpense.mutateAsync(expenseId);
        const result = await approveExpense.mutateAsync(expenseId);
        onSuccess(result);
      } else {
        // For new expenses, create with approval-pending status
        const result = await createExpense.mutateAsync(expenseInput);
        onSuccess(result);
      }
    },
    [createExpense, submitExpense, approveExpense, isEdit, expenseId, onSuccess]
  );

  return {
    submitDraft,
    submitForPreApproval,
    submitForFinalApproval,
    isSubmitting:
      createExpense.isPending ||
      updateExpense.isPending ||
      submitExpense.isPending ||
      approveExpense.isPending,
  };
}
