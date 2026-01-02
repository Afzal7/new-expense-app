"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Search,
  Filter,
  Receipt,
  Eye,
  Trash2,
  RotateCcw,
  Building2,
  Shield,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useExpenses } from "@/hooks/use-expenses";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { useOrganization } from "@/hooks/use-organization";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import type { Expense } from "@/types/expense";

export default function ExpensesPage() {
  const router = useRouter();
  const {
    data: organization,
    isLoading: orgLoading,
    error: orgError,
  } = useOrganization();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "private" | "org">("all");
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const {
    data: expensesData,
    isLoading,
    error,
    refetch,
  } = useExpenses({
    page,
    limit: 10,
    search: search || undefined,
    type,
    includeDeleted,
  });

  const { deleteExpense, restoreExpense } = useExpenseMutations();

  if (orgLoading) {
    return <LoadingSkeleton type="list" count={5} />;
  }

  if (orgError || !organization) {
    return (
      <ErrorState
        message="Unable to load organization. Please ensure you have an organization set up."
        type="page"
        onRetry={() => window.location.reload()}
      />
    );
  }

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleTypeChange = (value: "all" | "private" | "org") => {
    setType(value);
    setPage(1); // Reset to first page when changing filter
  };

  const handleIncludeDeletedChange = (checked: boolean) => {
    setIncludeDeleted(checked);
    setPage(1); // Reset to first page when changing filter
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense.mutateAsync(expenseId);
  };

  const handleRestoreExpense = async (expenseId: string) => {
    await restoreExpense.mutateAsync(expenseId);
  };

  const getExpenseTitle = (expense: Expense) => {
    // Try to get a meaningful title from the first line item
    const firstItem = expense.lineItems[0];
    if (firstItem?.description) {
      return firstItem.description.length > 50
        ? `${firstItem.description.substring(0, 50)}...`
        : firstItem.description;
    }

    // Fall back to categories if available
    const categories = expense.lineItems
      .map((item) => item.category)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index); // unique

    if (categories.length > 0) {
      return categories.join(", ");
    }

    // Final fallback
    return `Expense #${expense.id.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl xl:max-w-4xl">
        {/* Header - Clean and minimal */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">
                Expenses
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">
                Your spending at a glance
              </p>
            </div>
            <Link href="/dashboard/expenses/create">
              <button className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm h-11 w-11 p-0 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Search - Subtle and clean */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:shadow-lg focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all duration-200 text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Filters - Minimal */}
          <div className="flex items-center justify-between">
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm px-3 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="org">Organization</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                id="include-deleted"
                checked={includeDeleted}
                onCheckedChange={handleIncludeDeletedChange}
                className="data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white scale-75"
              />
              <Label
                htmlFor="include-deleted"
                className="text-xs text-slate-600 dark:text-slate-400"
              >
                Deleted
              </Label>
            </div>
          </div>
        </div>

        {/* Expenses List - Feed style */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 animate-pulse"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-8 text-center">
            <ErrorState
              message="Failed to load expenses. Please try again."
              type="inline"
              onRetry={() => refetch()}
            />
          </div>
        ) : !expensesData?.expenses || expensesData.expenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No expenses yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {search
                ? "Try adjusting your search criteria."
                : "Create your first expense to get started."}
            </p>
            <Button
              asChild
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl px-6"
            >
              <Link href="/dashboard/expenses/create">
                <Plus className="w-4 h-4 mr-2" />
                New Expense
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {expensesData.expenses.map((expense) => (
              <Link key={expense.id} href={`/dashboard/expenses/${expense.id}`}>
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] p-6 cursor-pointer">
                  {/* Top row - Title and amount */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white truncate mb-1">
                        {getExpenseTitle(expense)}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5" />
                          <span>
                            {expense.lineItems.length} item
                            {expense.lineItems.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        ${expense.totalAmount.toFixed(2)}
                      </div>
                      {expense.organizationId ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-full">
                          <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Org
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
                          <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            Private
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status badge and actions */}
                  <div className="flex items-center gap-2">
                    {expense.state === "Approved" && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/30 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                          Approved
                        </span>
                      </div>
                    )}
                    {expense.state === "Rejected" && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/30 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-medium text-red-700 dark:text-red-300">
                          Rejected
                        </span>
                      </div>
                    )}
                    {expense.state === "Pre-Approval Pending" && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 rounded-full">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                          Pending
                        </span>
                      </div>
                    )}
                    {expense.deletedAt && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/30 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-medium text-red-700 dark:text-red-300">
                          Deleted
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination - Minimal */}
        {expensesData && expensesData.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700"
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400 px-2">
              {page} of {expensesData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === expensesData.totalPages}
              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
