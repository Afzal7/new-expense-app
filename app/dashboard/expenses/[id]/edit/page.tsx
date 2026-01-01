"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expense-form";
import { useOrganization } from "@/hooks/use-organization";
import { useExpense } from "@/hooks/use-expenses";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: organization,
    isLoading: orgLoading,
    error: orgError,
  } = useOrganization();
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

  if (orgLoading || expenseLoading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton type="form" count={3} />
      </div>
    );
  }

  if (orgError || expenseError || !organization || !expense) {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Edit Expense
            </h1>
            <p className="text-muted-foreground">
              Update the expense details and line items
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl border shadow-sm p-8">
          <ExpenseForm
            initialData={expense}
            organizationId={organization.id}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
