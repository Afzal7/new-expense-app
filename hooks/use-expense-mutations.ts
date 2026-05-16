import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Expense, ExpenseInput, ExpenseUpdatePayload } from "@/types/expense";
import { toast } from "@/lib/toast";
import { parseExpenseApiErrorMessage } from "@/lib/utils/parse-expense-api-error";

function expenseErrorToast(
  error: Error,
  action: string,
  hardFallbackReason: string
): void {
  const msg =
    error.message.trim() !== ""
      ? error.message
      : parseExpenseApiErrorMessage(null, {
          action,
          fallbackReason: hardFallbackReason,
        });
  toast.error(msg);
}

export function useExpenseMutations() {
  const queryClient = useQueryClient();

  const createExpense = useMutation({
    mutationFn: async (expenseInput: ExpenseInput): Promise<Expense> => {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseInput),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "save the new expense",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense created successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "save the new expense",
        "something went wrong"
      );
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({
      id,
      expenseInput,
    }: {
      id: string;
      expenseInput: ExpenseUpdatePayload;
    }): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseInput),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "save changes to the expense",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", variables.id] });
      toast.success("Expense updated successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "save changes to the expense",
        "something went wrong"
      );
    },
  });

  const submitExpense = useMutation({
    mutationFn: async (id: string): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "submit" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "submit the expense for pre-approval",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense submitted for pre-approval successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "submit the expense for pre-approval",
        "something went wrong"
      );
    },
  });

  const submitExpenseForFinalApproval = useMutation({
    mutationFn: async (id: string): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "submit-for-final-approval" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "submit the expense for final approval",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense submitted for final approval successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "submit the expense for final approval",
        "something went wrong"
      );
    },
  });

  const approveExpense = useMutation({
    mutationFn: async (id: string): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "approve the expense",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense approved successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "approve the expense",
        "something went wrong"
      );
    },
  });

  const rejectExpense = useMutation({
    mutationFn: async (id: string): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "reject the expense",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense rejected successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "reject the expense",
        "something went wrong"
      );
    },
  });

  const reimburseExpense = useMutation({
    mutationFn: async (id: string): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reimburse" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "mark the expense as reimbursed",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense reimbursed successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "mark the expense as reimbursed",
        "something went wrong"
      );
    },
  });

  const bulkReimburseExpenses = useMutation({
    mutationFn: async (ids: string[]): Promise<Expense[]> => {
      const promises = ids.map((id) =>
        fetch(`/api/expenses/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "reimburse" }),
        }).then(async (response) => {
          if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(
              parseExpenseApiErrorMessage(body, {
                action: `reimburse expense ${id}`,
                fallbackReason: "the server response could not be read",
              })
            );
          }
          return response.json();
        })
      );

      return Promise.all(promises);
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(
        `${ids.length} expense${ids.length > 1 ? "s" : ""} reimbursed successfully`
      );
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "reimburse the selected expenses",
        "one or more reimbursements failed"
      );
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "delete the expense",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "delete the expense",
        "something went wrong"
      );
    },
  });

  const restoreExpense = useMutation({
    mutationFn: async (id: string): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "restore" }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "restore the expense",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense restored successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "restore the expense",
        "something went wrong"
      );
    },
  });

  const changeExpenseStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      comment,
    }: {
      id: string;
      status: string;
      comment?: string;
    }): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "change-status", status, comment }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          parseExpenseApiErrorMessage(body, {
            action: "update the expense status",
            fallbackReason: "the server response could not be read",
          })
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense status changed successfully");
    },
    onError: (error) => {
      expenseErrorToast(
        error instanceof Error ? error : new Error(String(error)),
        "update the expense status",
        "something went wrong"
      );
    },
  });

  return {
    createExpense,
    updateExpense,
    submitExpense,
    submitExpenseForFinalApproval,
    approveExpense,
    rejectExpense,
    reimburseExpense,
    bulkReimburseExpenses,
    deleteExpense,
    restoreExpense,
    changeExpenseStatus,
  };
}
