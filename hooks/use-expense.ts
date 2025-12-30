import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpenseAction, getExpensesAction, getExpenseByIdAction, getPersonalDraftsAction } from '@/app/dashboard/expenses/_actions/expense-actions';
import { updateExpenseAction, deleteExpenseAction } from '@/app/dashboard/expenses/_actions/edit-actions';

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

// Hook for fetching expenses
export function useExpenses(organizationId?: string) {
  return useQuery({
    queryKey: expenseKeys.list({ organizationId }),
    queryFn: async () => {
      const result = await getExpensesAction(organizationId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

// Hook for fetching personal drafts (for vault dashboard)
export function usePersonalDrafts() {
  return useQuery({
    queryKey: [...expenseKeys.lists(), 'personal-drafts'],
    queryFn: async () => {
      const result = await getPersonalDraftsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

// Hook for fetching a single expense
export function useExpense(expenseId: string, organizationId?: string) {
  return useQuery({
    queryKey: expenseKeys.detail(expenseId),
    queryFn: async () => {
      const result = await getExpenseByIdAction(expenseId, organizationId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!expenseId,
  });
}

// Hook for creating expenses
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpenseAction,
    onSuccess: () => {
      // Invalidate and refetch expense queries
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
    onError: (error) => {
      console.error('Error creating expense:', error);
    },
  });
}

// Hook for updating expenses
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expenseId, formData }: { expenseId: string; formData: FormData }) => {
      const result = await updateExpenseAction(expenseId, formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
    onError: (error) => {
      console.error('Error updating expense:', error);
    },
  });
}

// Hook for deleting expenses
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const result = await deleteExpenseAction(expenseId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting expense:', error);
    },
  });
}