"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseList } from "@/components/shared/expense-list";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { useSession } from "@/lib/auth-client";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import { ExpenseBusinessRules } from "@/lib/utils/expense-business-logic";
import type { Expense } from "@/types/expense";

export function ManagerApprovalsClient() {
  const { data: session } = useSession();
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

  const renderActions = (expense: Expense) => {
    // Check if current user is assigned as a manager for this expense
    const isAssignedManager =
      session?.user?.id && expense.managerIds?.includes(session.user.id);

    if (!isAssignedManager) {
      return (
        <div className="text-xs text-muted-foreground">
          Not assigned as manager
        </div>
      );
    }

    // Check if approval is a valid transition
    const canApprove = ExpenseBusinessRules.canTransitionToState(
      expense.state,
      expense.state === EXPENSE_STATES.PRE_APPROVAL_PENDING
        ? EXPENSE_STATES.PRE_APPROVED
        : EXPENSE_STATES.APPROVED,
      session?.user?.id,
      expense.managerIds
    );

    // Check if rejection is a valid transition
    const canReject = ExpenseBusinessRules.canTransitionToState(
      expense.state,
      EXPENSE_STATES.REJECTED,
      session?.user?.id,
      expense.managerIds
    );

    if (!canApprove && !canReject) {
      return (
        <div className="text-xs text-muted-foreground">
          No actions available
        </div>
      );
    }

    const isPreApproval = expense.state === EXPENSE_STATES.PRE_APPROVAL_PENDING;
    const approveActionText = isPreApproval ? "Pre-Approve" : "Approve";

    return (
      <>
        {canApprove && (
          <Button
            size="sm"
            onClick={() => handleApprove(expense.id)}
            disabled={approveExpense.isPending}
            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-4 h-8 text-xs font-medium"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            {approveActionText}
          </Button>
        )}
        {canReject && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReject(expense.id)}
            disabled={rejectExpense.isPending}
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30 rounded-2xl px-4 h-8 text-xs font-medium"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Reject
          </Button>
        )}
      </>
    );
  };

  return (
    <div className="space-y-8">
      {/* Pre-Approval Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Pre-Approval Requests
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Initial review and pre-approval for expense submissions. These
            expenses need your approval before they can proceed to final
            approval.
          </p>
        </div>
        <ExpenseList
          routePrefix="/dashboard/manager/approvals"
          variant="cards"
          additionalFilters={{
            state: [EXPENSE_STATES.PRE_APPROVAL_PENDING],
          }}
          showColumns={{
            employee: true,
            organization: true,
            actions: true,
          }}
          renderActions={renderActions}
        />
      </div>

      {/* Final Approval Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Final Approval Requests
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Final approval for expenses that have been pre-approved. Approved
            expenses will be ready for reimbursement processing.
          </p>
        </div>
        <ExpenseList
          routePrefix="/dashboard/manager/approvals"
          variant="cards"
          additionalFilters={{
            state: [EXPENSE_STATES.APPROVAL_PENDING],
          }}
          showColumns={{
            employee: true,
            organization: true,
            actions: true,
          }}
          renderActions={renderActions}
        />
      </div>
    </div>
  );
}
