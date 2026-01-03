"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseList } from "@/components/shared/expense-list";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import type { Expense } from "@/types/expense";

export function ManagerApprovalsClient() {
  const { approveExpense, rejectExpense } = useExpenseMutations();

  const handleApprove = async (expenseId: string) => {
    try {
      await approveExpense.mutateAsync(expenseId);
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      await rejectExpense.mutateAsync(expenseId);
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const renderActions = (expense: Expense) => (
    <div className="flex gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => handleApprove(expense.id)}
        disabled={approveExpense.isPending}
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Approve
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleReject(expense.id)}
        disabled={rejectExpense.isPending}
      >
        <XCircle className="w-4 h-4 mr-1" />
        Reject
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Ready for Approvals
        </h1>
        <p className="text-muted-foreground">
          Review and approve expense requests from your team members.
        </p>
      </div>

      <ExpenseList
        routePrefix="/dashboard/manager/approvals"
        additionalFilters={{
          state: [
            EXPENSE_STATES.PRE_APPROVAL_PENDING,
            EXPENSE_STATES.APPROVAL_PENDING,
          ],
        }}
        showColumns={{
          employee: true,
          organization: true,
          actions: true,
        }}
        renderActions={renderActions}
      />
    </div>
  );
}
