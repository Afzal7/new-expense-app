"use client";

import { useRouter } from "next/navigation";
import { ExpenseForm } from "@/components/expense-form";
import { useOrganization } from "@/hooks/use-organization";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import type { Expense, ExpenseInput } from "@/types/expense";

export default function CreateExpensePage() {
  const router = useRouter();
  const { data: organization, isLoading, error } = useOrganization();

  const handleSuccess = (data: Expense | ExpenseInput) => {
    // When creating, API returns Expense with id, so we can safely cast
    const expenseData = data as Expense;
    router.push(`/dashboard/expenses/${expenseData.id}`);
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return <LoadingSkeleton type="form" count={3} />;
  }

  if (error || !organization) {
    return (
      <ErrorState
        message="Unable to load organization. Please ensure you have an organization set up."
        type="page"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Expense</h1>
        <p className="text-muted-foreground">
          Add a new expense to your organization.
        </p>
      </div>

      <div className="max-w-2xl">
        <ExpenseForm
          organizationId={organization.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
