"use client";

import React, { useMemo } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { useExpenseFormSubmission } from "@/hooks/use-expense-form-submission";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import { ManagerSelector } from "./expenses/ManagerSelector";
import { LineItemsSection } from "./expenses/LineItemsSection";
import { ExpenseActionButtonGroup } from "./expenses/ExpenseFormActions";
import { ExpenseFormSchema } from "@/lib/validations/expense";
import {
  calculateLineItemsTotal,
  createDefaultLineItem,
  hasLineItems,
  isDraftExpense as checkIsDraftExpense,
  totalsMatch,
  formatCurrency,
} from "@/lib/utils/expense-form";
import { ExpenseBusinessRules } from "@/lib/utils/expense-business-logic";
import type { Expense } from "@/types/expense";
import type { ExpenseFormData, FormLineItem } from "@/lib/utils/expense-form";

interface ExpenseFormProps {
  initialData?: Expense;
  organizationId?: string;
  onSuccess: (data: Expense) => void;
  onCancel: () => void;
}

export function ExpenseForm({
  initialData,
  organizationId,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const {
    data: organization,
    isLoading: orgLoading,
    error: orgError,
  } = useOrganizationMembers(organizationId || "");

  const {
    submitDraft,
    submitForPreApproval,
    submitForFinalApproval,
    isSubmitting,
  } = useExpenseFormSubmission({
    expenseId: initialData?.id,
    onSuccess,
  });

  const isEdit = !!initialData;

  const formMethods = useForm<ExpenseFormData>({
    resolver: zodResolver(ExpenseFormSchema),
    defaultValues: {
      totalAmount: initialData?.totalAmount,
      managerIds: initialData?.managerIds,
      lineItems: initialData?.lineItems?.map((item) => ({
        amount: item.amount,
        date: new Date(item.date).toISOString().split("T")[0],
        description: item.description || "",
        category: item.category || "",
        attachments: item.attachments,
      })),
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // Use memoized values for better performance
  const formData = watch();
  const managerIds = formData.managerIds || [];
  const lineItems = formData.lineItems || [];
  const totalAmount = formData.totalAmount || 0;
  const isDraft = checkIsDraftExpense(initialData);
  const hasAnyLineItems = hasLineItems(formData);

  // Memoized calculations
  const calculatedTotal = useMemo(
    () => calculateLineItemsTotal(lineItems),
    [lineItems]
  );

  const totalsAreMatching = useMemo(
    () => totalsMatch(totalAmount, calculatedTotal),
    [totalAmount, calculatedTotal]
  );

  // Auto-fill function for total amount
  const handleAutoFill = React.useCallback(() => {
    setValue("totalAmount", calculatedTotal);
  }, [calculatedTotal, setValue]);

  // Business rule checks
  const canModifyTotal = ExpenseBusinessRules.canModifyTotalAmount(initialData);
  const canModifyLineItems =
    ExpenseBusinessRules.canModifyLineItems(initialData);

  if (orgLoading) {
    return <LoadingSkeleton type="form" count={1} />;
  }

  if (orgError) {
    return (
      <ErrorState
        message="Failed to load organization members. Please try again."
        type="inline"
        onRetry={() => window.location.reload()}
      />
    );
  }

  const onSubmit = async (data: ExpenseFormData): Promise<void> => {
    await submitDraft(data);
  };

  const handleSubmitForApproval = async (): Promise<void> => {
    await submitForPreApproval(formData);
  };

  const handleSubmitForFinalApproval = async (): Promise<void> => {
    await submitForFinalApproval(formData);
  };

  const addLineItem = () => {
    append(createDefaultLineItem());
  };

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 lg:space-y-8"
      >
        {/* Header Section */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {isEdit ? "Edit Expense" : "Expense Details"}
          </h2>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update your expense information"
              : "Record your expense details"}
          </p>
        </div>

        {/* Primary Fields: Total Amount & Manager (Required for Pre-Approval) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Amount */}
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="totalAmount" className="text-base font-medium">
                Total Amount *
              </Label>
              <p className="text-sm text-muted-foreground">
                Total expense amount (required for approval)
              </p>
            </div>
            {canModifyTotal ? (
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                {...register("totalAmount", { valueAsNumber: true })}
                className="h-11"
                placeholder=""
              />
            ) : (
              <div className="relative">
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={formatCurrency(totalAmount)}
                  readOnly
                  className="bg-muted/50 h-11"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Locked
                  </span>
                </div>
              </div>
            )}
            {errors?.totalAmount && (
              <p className="text-sm text-destructive">
                {errors.totalAmount.message}
              </p>
            )}
          </div>

          {/* Manager Selection */}
          <ManagerSelector
            organization={organization}
            watchedManagerIds={managerIds}
            onSelectionChange={(ids: string[]) => setValue("managerIds", ids)}
            errors={errors}
          />
        </div>

        {/* Primary Content: Line Items (Expense Details) */}
        <LineItemsSection
          fields={fields}
          onAddLineItem={addLineItem}
          onRemoveLineItem={remove}
        />

        {/* Summary & Actions */}
        {calculatedTotal > 0 && (
          <div className="bg-muted/30 rounded-lg p-6 border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Calculated Total
                </Label>
                <p className="text-sm text-muted-foreground">
                  Based on {fields.length} line item
                  {fields.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-left lg:text-right space-y-2">
                <div className="text-3xl font-bold">
                  {formatCurrency(calculatedTotal)}
                </div>
                {canModifyTotal && !totalsAreMatching && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFill}
                    className="h-9"
                  >
                    Use This Amount
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <ExpenseActionButtonGroup
            isEdit={isEdit}
            isDraft={isDraft}
            hasLineItems={hasAnyLineItems}
            isSubmitting={isSubmitting}
            submitExpensePending={isEdit ? isSubmitting : isSubmitting}
            approveExpensePending={isEdit ? isSubmitting : isSubmitting}
            expense={initialData}
            onSubmit={handleSubmit(onSubmit)}
            onSubmitForApproval={handleSubmitForApproval}
            onSubmitForFinalApproval={handleSubmitForFinalApproval}
            onCancel={onCancel}
          />
        </div>
      </form>
    </FormProvider>
  );
}
