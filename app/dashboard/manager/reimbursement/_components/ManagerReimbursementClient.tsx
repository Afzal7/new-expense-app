"use client";

import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportControls } from "@/components/finance/export-controls";
import { ExpenseList } from "@/components/shared/expense-list";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import type { Expense } from "@/types/expense";

export function ManagerReimbursementClient() {
  const { reimburseExpense } = useExpenseMutations();

  const handleReimburse = async (expenseId: string) => {
    try {
      await reimburseExpense.mutateAsync(expenseId);
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const renderActions = (expense: Expense) => (
    <div className="flex gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => handleReimburse(expense.id)}
        disabled={reimburseExpense.isPending}
        className="bg-green-600 hover:bg-green-700"
      >
        <DollarSign className="w-4 h-4 mr-1" />
        Reimburse
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Ready for Reimbursement
        </h1>
        <p className="text-muted-foreground">
          Process approved expenses that are ready for reimbursement.
        </p>
      </div>

      <ExportControls />

      <ExpenseList
        routePrefix="/dashboard/manager/reimbursement"
        additionalFilters={{
          state: EXPENSE_STATES.APPROVED,
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
