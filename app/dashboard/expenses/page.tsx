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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ExpenseForm } from "@/components/expense-form";
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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingExpense(null);
    refetch();
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingExpense(null);
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            Manage your expense reports and submissions.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/expenses/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Expense
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-[140px]">
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
                <Label htmlFor="include-deleted" className="text-sm">
                  Include Deleted
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton type="list" count={5} />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorState
                message="Failed to load expenses. Please try again."
                type="inline"
                onRetry={() => refetch()}
              />
            </div>
          ) : !expensesData?.expenses || expensesData.expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses found"
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
          ) : (
            <div className="divide-y">
              {expensesData.expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${expense.deletedAt ? "line-through text-muted-foreground" : ""}`}
                        >
                          {getExpenseTitle(expense)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${expense.totalAmount.toFixed(2)} •{" "}
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
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            expense.state === "Approved"
                              ? "default"
                              : expense.state === "Rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {expense.state}
                        </Badge>
                        {expense.deletedAt && (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Deleted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={`font-semibold ${expense.deletedAt ? "line-through text-muted-foreground" : ""}`}
                      >
                        ${expense.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {expense.organizationId ? "Organization" : "Private"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/expenses/${expense.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {expense.deletedAt ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreExpense(expense.id)}
                        disabled={restoreExpense.isPending}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Dialog
                          open={
                            isEditDialogOpen &&
                            editingExpense?.id === expense.id
                          }
                          onOpenChange={setIsEditDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingExpense(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Expense</DialogTitle>
                            </DialogHeader>
                            {editingExpense && (
                              <ExpenseForm
                                initialData={editingExpense}
                                organizationId={organization.id}
                                onSuccess={handleEditSuccess}
                                onCancel={handleEditCancel}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <ConfirmationDialog
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deleteExpense.isPending}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {expensesData && expensesData.totalPages > 1 && (
        <div className="flex items-center justify-between">
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
