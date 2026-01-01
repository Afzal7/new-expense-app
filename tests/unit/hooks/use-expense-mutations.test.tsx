import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { toast } from "@/lib/toast";
import type { Expense, ExpenseInput } from "@/types/expense";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
vi.mock("@/lib/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Create a wrapper component for providing QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useExpenseMutations", () => {
  const mockExpense: Expense = {
    id: "expense-1",
    userId: "user-1",
    organizationId: "org-1",
    managerIds: ["manager-1"],
    totalAmount: 100,
    state: "draft",
    lineItems: [
      {
        amount: 100,
        date: new Date("2023-12-01"),
        description: "Test expense",
        category: "Office",
        attachments: [],
      },
    ],
    auditLog: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExpenseInput: ExpenseInput = {
    totalAmount: 100,
    managerIds: ["manager-1"],
    lineItems: [
      {
        amount: 100,
        date: new Date("2023-12-01"),
        description: "Test expense",
        category: "Office",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe("createExpense", () => {
    it("successfully creates an expense", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExpense),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      const mutationResult =
        await result.current.createExpense.mutateAsync(mockExpenseInput);

      expect(mockFetch).toHaveBeenCalledWith("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockExpenseInput),
      });

      expect(mutationResult).toEqual(mockExpense);
      expect(toast.success).toHaveBeenCalledWith(
        "Expense created successfully"
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("handles create expense error", async () => {
      const errorMessage = "Failed to create expense";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.createExpense.mutateAsync(mockExpenseInput)
      ).rejects.toThrow(errorMessage);

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe("updateExpense", () => {
    it("successfully updates an expense", async () => {
      const updatedExpense = { ...mockExpense, totalAmount: 200 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedExpense),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      const mutationResult = await result.current.updateExpense.mutateAsync({
        id: "expense-1",
        expenseInput: mockExpenseInput,
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/expenses/expense-1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockExpenseInput),
      });

      expect(mutationResult).toEqual(updatedExpense);
      expect(toast.success).toHaveBeenCalledWith(
        "Expense updated successfully"
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("handles update expense error", async () => {
      const errorMessage = "Failed to update expense";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.updateExpense.mutateAsync({
          id: "expense-1",
          expenseInput: mockExpenseInput,
        })
      ).rejects.toThrow(errorMessage);

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe("submitExpense", () => {
    it("successfully submits an expense", async () => {
      const submittedExpense = { ...mockExpense, state: "submitted" as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(submittedExpense),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      const mutationResult =
        await result.current.submitExpense.mutateAsync("expense-1");

      expect(mockFetch).toHaveBeenCalledWith("/api/expenses/expense-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "submit" }),
      });

      expect(mutationResult).toEqual(submittedExpense);
      expect(toast.success).toHaveBeenCalledWith(
        "Expense submitted for pre-approval successfully"
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("handles submit expense error", async () => {
      const errorMessage = "Failed to submit expense";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.submitExpense.mutateAsync("expense-1")
      ).rejects.toThrow(errorMessage);

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe("approveExpense", () => {
    it("successfully approves an expense", async () => {
      const approvedExpense = { ...mockExpense, state: "approved" as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(approvedExpense),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      const mutationResult =
        await result.current.approveExpense.mutateAsync("expense-1");

      expect(mockFetch).toHaveBeenCalledWith("/api/expenses/expense-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "approve" }),
      });

      expect(mutationResult).toEqual(approvedExpense);
      expect(toast.success).toHaveBeenCalledWith(
        "Expense approved successfully"
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("handles approve expense error", async () => {
      const errorMessage = "Failed to approve expense";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.approveExpense.mutateAsync("expense-1")
      ).rejects.toThrow(errorMessage);

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe("rejectExpense", () => {
    it("successfully rejects an expense", async () => {
      const rejectedExpense = { ...mockExpense, state: "rejected" as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rejectedExpense),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      const mutationResult =
        await result.current.rejectExpense.mutateAsync("expense-1");

      expect(mockFetch).toHaveBeenCalledWith("/api/expenses/expense-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject" }),
      });

      expect(mutationResult).toEqual(rejectedExpense);
      expect(toast.success).toHaveBeenCalledWith(
        "Expense rejected successfully"
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("handles reject expense error", async () => {
      const errorMessage = "Failed to reject expense";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.rejectExpense.mutateAsync("expense-1")
      ).rejects.toThrow(errorMessage);

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe("reimburseExpense", () => {
    it("successfully reimburses an expense", async () => {
      const reimbursedExpense = {
        ...mockExpense,
        state: "reimbursed" as const,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(reimbursedExpense),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      const mutationResult =
        await result.current.reimburseExpense.mutateAsync("expense-1");

      expect(mockFetch).toHaveBeenCalledWith("/api/expenses/expense-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reimburse" }),
      });

      expect(mutationResult).toEqual(reimbursedExpense);
      expect(toast.success).toHaveBeenCalledWith(
        "Expense reimbursed successfully"
      );
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("handles reimburse expense error", async () => {
      const errorMessage = "Failed to reimburse expense";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      } as Response);

      const { result } = renderHook(() => useExpenseMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.reimburseExpense.mutateAsync("expense-1")
      ).rejects.toThrow(errorMessage);

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  it("handles network errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useExpenseMutations(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.createExpense.mutateAsync(mockExpenseInput)
    ).rejects.toThrow("Network error");

    expect(toast.error).toHaveBeenCalledWith("Network error");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("handles malformed JSON error responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error("Invalid JSON")),
    } as Response);

    const { result } = renderHook(() => useExpenseMutations(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.createExpense.mutateAsync(mockExpenseInput)
    ).rejects.toThrow("Failed to create expense");

    expect(toast.error).toHaveBeenCalledWith("Failed to create expense");
    expect(toast.success).not.toHaveBeenCalled();
  });
});
