import { useQuery } from "@tanstack/react-query";
import type { Expense } from "@/types/expense";

interface UseExpensesOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: "all" | "private" | "org";
  includeDeleted?: boolean;
}

interface ExpensesResponse {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    type = "all",
    includeDeleted = false,
  } = options;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    type,
  });

  if (search) {
    queryParams.set("search", search);
  }

  if (includeDeleted) {
    queryParams.set("includeDeleted", "true");
  }

  return useQuery<ExpensesResponse>({
    queryKey: ["expenses", page, limit, search, type, includeDeleted],
    queryFn: async () => {
      const response = await fetch(`/api/expenses?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      return response.json();
    },
  });
}

export function useExpense(id: string) {
  return useQuery<Expense>({
    queryKey: ["expense", id],
    queryFn: async () => {
      const response = await fetch(`/api/expenses/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch expense");
      }
      return response.json();
    },
  });
}
