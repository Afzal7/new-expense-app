"use client";

import ApprovalButtonGroup from "@/components/approval-button-group";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Building2,
  Shield,
  Receipt,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { useExpense } from "@/hooks/use-expenses";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import type { AuditEntry, Expense, LineItem } from "@/types/expense";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: expense, isLoading, error } = useExpense(id);
  const { approveExpense, rejectExpense, reimburseExpense, deleteExpense } =
    useExpenseMutations();

  const approvalOptions = [
    {
      label: "Approve",
      description: "Approve this expense for further processing.",
      action: "approve",
      variant: "default" as const,
    },
    {
      label: "Reject",
      description: "Reject this expense submission.",
      action: "reject",
      variant: "destructive" as const,
    },
    {
      label: "Reimburse",
      description: "Mark this expense as reimbursed.",
      action: "reimburse",
      variant: "default" as const,
    },
  ];

  const handleAction = async (action: string) => {
    if (!expense) return;

    switch (action) {
      case "approve":
        await approveExpense.mutateAsync(expense.id);
        break;
      case "reject":
        await rejectExpense.mutateAsync(expense.id);
        break;
      case "reimburse":
        await reimburseExpense.mutateAsync(expense.id);
        break;
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense.mutateAsync(expenseId);
    router.push("/dashboard/expenses");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl xl:max-w-4xl">
          <div className="space-y-6">
            <LoadingSkeleton type="card" count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl xl:max-w-4xl">
          <ErrorState
            message="Failed to load expense details. Please try again."
            type="page"
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const canApprove = expense.state === "Pre-Approval Pending";
  const canReject = ["Pre-Approval Pending", "Pre-Approved"].includes(
    expense.state
  );
  const canReimburse = expense.state === "Approved";

  const availableOptions = approvalOptions.filter((option) => {
    switch (option.action) {
      case "approve":
        return canApprove;
      case "reject":
        return canReject;
      case "reimburse":
        return canReimburse;
    }
    return false;
  });

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
      .map((item: LineItem) => item.category)
      .filter((category): category is string => Boolean(category))
      .filter(
        (value: string, index: number, self: string[]) =>
          self.indexOf(value) === index
      ); // unique

    if (categories.length > 0) {
      return categories.join(", ");
    }

    // Final fallback
    return `Expense #${expense.id.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl xl:max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-11 w-11 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-light text-slate-900 dark:text-white">
                Expense Details
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">
                {getExpenseTitle(expense)}
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!expense.deletedAt && (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Link href={`/dashboard/expenses/${expense.id}/edit`}>
                      <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </Link>
                  </Button>
                  <ConfirmationDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-600"
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
              {availableOptions.length > 0 && (
                <ApprovalButtonGroup
                  options={availableOptions}
                  onAction={handleAction}
                  disabled={
                    approveExpense.isPending ||
                    rejectExpense.isPending ||
                    reimburseExpense.isPending
                  }
                />
              )}
            </div>
          </div>

          {/* Status badges - Icon-based */}
          <div className="flex items-center gap-3 mb-6">
            {expense.state === "Approved" && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Approved
                </span>
              </div>
            )}
            {expense.state === "Rejected" && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/30 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Rejected
                </span>
              </div>
            )}
            {expense.state === "Pre-Approval Pending" && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 rounded-full">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Pending
                </span>
              </div>
            )}
            <span className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {expense.id.slice(-8)}
            </span>
          </div>

          {/* Privacy Notice for Private Expenses */}
          {!expense.organizationId && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl mb-6">
              <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                  Private Expense
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Only visible to you
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Total Amount - Bold and prominent */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Amount
              </p>
              <p className="text-5xl font-bold text-slate-900 dark:text-white mt-2">
                ${expense.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="h-16 w-16 bg-slate-900/5 dark:bg-white/10 rounded-2xl flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-slate-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <h2 className="text-xl font-medium text-slate-900 dark:text-white">
              Additional Details
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Created
              </span>
              <span className="text-sm text-slate-900 dark:text-white">
                {new Date(expense.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Last Updated
              </span>
              <span className="text-sm text-slate-900 dark:text-white">
                {new Date(
                  expense.updatedAt || expense.createdAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {expense.organizationId && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Organization
                </span>
                <span className="text-sm text-slate-900 dark:text-white">
                  {expense.organizationId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items - Clean list */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Receipt className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-white">
                  Line Items
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {expense.lineItems.length} item
                  {expense.lineItems.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {expense.lineItems.map((item: LineItem, index: number) => (
              <div
                key={index}
                className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      {item.description || "No description"}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      {item.category && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                          {item.category}
                        </span>
                      )}
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      ${item.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log - Clean timeline */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-white">
                  Activity
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {expense.auditLog.length} event
                  {expense.auditLog.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {expense.auditLog.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No activity recorded yet
                </p>
              </div>
            ) : (
              expense.auditLog
                .sort(
                  (a: AuditEntry, b: AuditEntry) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((entry: AuditEntry, index: number) => (
                  <div
                    key={index}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {entry.action}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(entry.date).toLocaleDateString()} at{" "}
                            {new Date(entry.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Actor: {entry.actorId}
                        </p>
                        {entry.previousValues &&
                          Object.keys(entry.previousValues).length > 0 && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                                Previous Values
                              </p>
                              <pre className="text-xs bg-white dark:bg-slate-800 p-3 rounded-lg border overflow-x-auto break-words text-slate-800 dark:text-slate-200">
                                {JSON.stringify(entry.previousValues, null, 2)}
                              </pre>
                            </div>
                          )}
                        {entry.updatedValues &&
                          Object.keys(entry.updatedValues).length > 0 && (
                            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                                Updated Values
                              </p>
                              <pre className="text-xs bg-white dark:bg-slate-800 p-3 rounded-lg border overflow-x-auto break-words text-slate-800 dark:text-slate-200">
                                {JSON.stringify(entry.updatedValues, null, 2)}
                              </pre>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
