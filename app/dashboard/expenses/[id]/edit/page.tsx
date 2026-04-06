"use client";

import { useParams, useRouter } from "next/navigation";
import { ExpenseForm } from "@/components/expense-form";
import { useExpense } from "@/hooks/use-expenses";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: expense,
    isLoading: expenseLoading,
    error: expenseError,
  } = useExpense(id);

  const handleSuccess = () => {
    router.push(`/dashboard/expenses/${id}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/expenses/${id}`);
  };

  if (expenseLoading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton type="form" count={3} />
      </div>
    );
  }

  if (expenseError || !expense) {
    return (
      <div className="space-y-8">
        <ErrorState
          message="Unable to load expense data. Please try again."
          type="page"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <ExpenseForm
      initialData={expense}
      organizationId={expense.organizationId ?? undefined}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
