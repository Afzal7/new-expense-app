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
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Manage and track your expense reports
            </p>
          </div>
          <Button asChild size="default" className="shadow-sm">
            <Link href="/dashboard/expenses/create">
              <Plus className="mr-2 h-4 w-4" />
              New Expense
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11 bg-background/50 border-0 shadow-sm focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[140px] h-9 bg-background/50 border-0 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expenses</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="org">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="include-deleted"
              checked={includeDeleted}
              onCheckedChange={handleIncludeDeletedChange}
            />
            <Label
              htmlFor="include-deleted"
              className="text-sm text-muted-foreground"
            >
              Include deleted
            </Label>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-6">
              <LoadingSkeleton type="list" count={1} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-card rounded-lg border p-8">
          <ErrorState
            message="Failed to load expenses. Please try again."
            type="inline"
            onRetry={() => refetch()}
          />
        </div>
      ) : !expensesData?.expenses || expensesData.expenses.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description={
              search
                ? "Try adjusting your search criteria."
                : "Create your first expense to get started."
            }
            action={{
              label: "Create Expense",
              onClick: () => router.push("/dashboard/expenses/create"),
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {expensesData.expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-card rounded-lg border p-6 hover:shadow-sm transition-all duration-200 hover:border-border/80"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3
                      className={`font-semibold truncate text-base ${expense.deletedAt ? "line-through text-muted-foreground" : ""}`}
                    >
                      {getExpenseTitle(expense)}
                    </h3>
                    <Badge
                      variant={
                        expense.state === "Approved"
                          ? "default"
                          : expense.state === "Rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {expense.state}
                    </Badge>
                    {expense.deletedAt && (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground text-xs"
                      >
                        Deleted
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {expense.lineItems.length} item
                    {expense.lineItems.length !== 1 ? "s" : ""} • Created{" "}
                    {new Date(expense.createdAt).toLocaleDateString()}
                    {expense.deletedAt && (
                      <>
                        {" "}
                        • Deleted{" "}
                        {new Date(expense.deletedAt).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-between lg:justify-end gap-4">
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${expense.deletedAt ? "line-through text-muted-foreground" : ""}`}
                    >
                      ${expense.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expense.organizationId ? "Organization" : "Private"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-10 w-10 p-0"
                    >
                      <Link href={`/dashboard/expenses/${expense.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {expense.deletedAt ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreExpense(expense.id)}
                        disabled={restoreExpense.isPending}
                        className="h-10 w-10 p-0"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-10 w-10 p-0"
                        >
                          <Link href={`/dashboard/expenses/${expense.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ConfirmationDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleteExpense.isPending}
                              className="h-10 w-10 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Delete Expense"
                          description="Are you sure you want to delete this expense? This action cannot be undone."
                          confirmText="Delete"
                          variant="destructive"
                          onConfirm={() => handleDeleteExpense(expense.id)}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {expensesData && expensesData.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {(expensesData.page - 1) * expensesData.limit + 1} to{" "}
            {Math.min(
              expensesData.page * expensesData.limit,
              expensesData.total
            )}{" "}
            of {expensesData.total} expenses
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {expensesData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === expensesData.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
