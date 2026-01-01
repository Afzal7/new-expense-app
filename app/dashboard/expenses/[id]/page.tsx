"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, User, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExpense } from "@/hooks/use-expenses";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import type { LineItem, AuditEntry } from "@/types/expense";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: expense, isLoading, error } = useExpense(id);
  const { approveExpense, rejectExpense, reimburseExpense } =
    useExpenseMutations();

  const handleApprove = async () => {
    if (!expense) return;
    await approveExpense.mutateAsync(expense.id);
  };

  const handleReject = async () => {
    if (!expense) return;
    await rejectExpense.mutateAsync(expense.id);
  };

  const handleReimburse = async () => {
    if (!expense) return;
    await reimburseExpense.mutateAsync(expense.id);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Expense #{expense.id.slice(-8)}
            </h1>
            <p className="text-muted-foreground">
              Created {new Date(expense.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canApprove && (
            <Button onClick={handleApprove} disabled={approveExpense.isPending}>
              Approve
            </Button>
          )}
          {canReject && (
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectExpense.isPending}
            >
              Reject
            </Button>
          )}
          {canReimburse && (
            <Button
              onClick={handleReimburse}
              disabled={reimburseExpense.isPending}
            >
              Reimburse
            </Button>
          )}
        </div>
      </div>

      {/* Expense Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Expense Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                ${expense.totalAmount.toFixed(2)}
              </span>
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
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{expense.organizationId ? "Organization" : "Private"}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <h3 className="font-semibold">Line Items</h3>
            <div className="space-y-2">
              {expense.lineItems.map((item: LineItem, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.description || "No description"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.category && `${item.category} • `}
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expense.auditLog.length === 0 ? (
              <p className="text-muted-foreground">No audit entries found.</p>
            ) : (
              expense.auditLog
                .sort(
                  (a: AuditEntry, b: AuditEntry) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((entry: AuditEntry, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{entry.action}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Actor: {entry.actorId}
                      </p>
                      {entry.previousValues &&
                        Object.keys(entry.previousValues).length > 0 && (
                          <div className="text-sm">
                            <p className="font-medium text-red-600">
                              Previous Values:
                            </p>
                            <pre className="text-xs bg-muted p-2 rounded mt-1">
                              {JSON.stringify(entry.previousValues, null, 2)}
                            </pre>
                          </div>
                        )}
                      {entry.updatedValues &&
                        Object.keys(entry.updatedValues).length > 0 && (
                          <div className="text-sm mt-2">
                            <p className="font-medium text-green-600">
                              Updated Values:
                            </p>
                            <pre className="text-xs bg-muted p-2 rounded mt-1">
                              {JSON.stringify(entry.updatedValues, null, 2)}
                            </pre>
                          </div>
                        )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
