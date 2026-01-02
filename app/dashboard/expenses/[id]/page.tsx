"use client";

import ApprovalButtonGroup from "@/components/approval-button-group";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { useExpense } from "@/hooks/use-expenses";
import type { AuditEntry, LineItem } from "@/types/expense";
import { ArrowLeft, Clock, DollarSign, FileText } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: expense, isLoading, error } = useExpense(id);
  const { approveExpense, rejectExpense, reimburseExpense } =
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <ErrorState
        message="Failed to load expense details. Please try again."
        type="page"
        onRetry={() => window.location.reload()}
      />
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
      default:
        return false;
    }
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">
                Expense Details
              </h1>
              <p className="text-muted-foreground">
                Created {new Date(expense.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {availableOptions.length > 0 && (
            <div className="flex gap-2">
              <ApprovalButtonGroup
                options={availableOptions}
                onAction={handleAction}
                disabled={
                  approveExpense.isPending ||
                  rejectExpense.isPending ||
                  reimburseExpense.isPending
                }
              />
            </div>
          )}
        </div>

        {/* Status and ID */}
        <div className="flex items-center gap-4">
          <Badge
            variant={
              expense.state === "Approved"
                ? "default"
                : expense.state === "Rejected"
                  ? "destructive"
                  : "secondary"
            }
            className="px-3 py-1"
          >
            {expense.state}
          </Badge>
          <span className="text-sm text-muted-foreground font-mono">
            {expense.id.slice(-8)}
          </span>
        </div>
      </div>

      {/* Expense Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Amount Card */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </p>
                <p className="text-3xl font-bold mt-1">
                  ${expense.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Expense Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">
                  {expense.organizationId ? "Organization" : "Private"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="p-6 lg:p-8 border-b">
          <h2 className="text-lg font-semibold">Line Items</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {expense.lineItems.length} item
            {expense.lineItems.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="divide-y">
          {expense.lineItems.map((item: LineItem, index: number) => (
            <div
              key={index}
              className="p-6 lg:p-8 hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <p className="font-medium">
                    {item.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {item.category && <span>{item.category}</span>}
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl font-semibold">
                    ${item.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="p-6 lg:p-8 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Activity</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {expense.auditLog.length} event
            {expense.auditLog.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="divide-y">
          {expense.auditLog.length === 0 ? (
            <div className="p-8 lg:p-12 text-center text-muted-foreground">
              No activity recorded yet
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
                  className="p-6 lg:p-8 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {entry.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()} at{" "}
                          {new Date(entry.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Actor: {entry.actorId}
                      </p>
                      {entry.previousValues &&
                        Object.keys(entry.previousValues).length > 0 && (
                          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                            <p className="text-sm font-medium text-destructive mb-2">
                              Previous Values
                            </p>
                            <pre className="text-xs bg-background/50 p-2 rounded border overflow-x-auto break-words">
                              {JSON.stringify(entry.previousValues, null, 2)}
                            </pre>
                          </div>
                        )}
                      {entry.updatedValues &&
                        Object.keys(entry.updatedValues).length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-green-700 mb-2">
                              Updated Values
                            </p>
                            <pre className="text-xs bg-background/50 p-2 rounded border overflow-x-auto break-words">
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
  );
}
