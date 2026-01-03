import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Expense, ExpenseInput } from "@/types/expense";
import { toast } from "@/lib/toast";

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
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to create expense" }));
        throw new Error(error.message || "Failed to create expense");
      }

      return response.json();
    },
    onSuccess: (_data) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create expense");
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({
      id,
      expenseInput,
    }: {
      id: string;
      expenseInput: ExpenseInput;
    }): Promise<Expense> => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseInput),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to update expense" }));
        throw new Error(error.message || "Failed to update expense");
      }

      return response.json();
    },
    onSuccess: (_data) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update expense");
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
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to submit expense" }));
        throw new Error(error.message || "Failed to submit expense");
      }

      return response.json();
    },
    onSuccess: (_data) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense submitted for pre-approval successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit expense");
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
        const error = await response.json().catch(() => ({
          message: "Failed to submit expense for final approval",
        }));
        throw new Error(
          error.message || "Failed to submit expense for final approval"
        );
      }

      return response.json();
    },
    onSuccess: (_data) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense submitted for final approval successfully");
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to submit expense for final approval"
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
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to approve expense" }));
        throw new Error(error.message || "Failed to approve expense");
      }

      return response.json();
    },
    onSuccess: (_data) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense approved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve expense");
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
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to reject expense" }));
        throw new Error(error.message || "Failed to reject expense");
      }

      return response.json();
    },
    onSuccess: (_data) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense rejected successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject expense");
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
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to reimburse expense" }));
        throw new Error(error.message || "Failed to reimburse expense");
      }

      return response.json();
    },
    onSuccess: (_data) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense reimbursed successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reimburse expense");
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
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to reimburse expense ${id}`);
          }
          return response.json();
        })
      );

      return Promise.all(promises);
    },
    onSuccess: (_data, ids) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(
        `${ids.length} expense${ids.length > 1 ? "s" : ""} reimbursed successfully`
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reimburse some expenses");
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
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to delete expense" }));
        throw new Error(error.message || "Failed to delete expense");
      }

      return response.json();
    },
    onSuccess: (_data) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete expense");
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
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to restore expense" }));
        throw new Error(error.message || "Failed to restore expense");
      }

      return response.json();
    },
    onSuccess: (_data) => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense restored successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to restore expense");
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
  };
}
