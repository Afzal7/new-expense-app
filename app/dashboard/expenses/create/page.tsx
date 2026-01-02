"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              New Expense
            </h1>
            <p className="text-muted-foreground">
              Record and submit your expense for approval
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-xl border shadow-sm p-6 lg:p-8">
          <ExpenseForm
            organizationId={organization.id}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
