"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { toast } from "sonner";
import type { Expense, ExpenseInput } from "@/types/expense";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import { ManagerSelector } from "./expenses/ManagerSelector";
import { LineItemsSection } from "./expenses/LineItemsSection";
import { ExpenseActionButtonGroup } from "./expenses/ExpenseFormActions";
import { ExpenseFormSchema } from "@/lib/validations/expense";

// Local type for the form that matches the ExpenseFormSchema (flexible for drafts)
type ExpenseFormData = {
  totalAmount?: number;
  managerIds?: string[];
  lineItems?: {
    amount?: number;
    date: string;
    description?: string;
    category?: string;
    attachments?: string[];
  }[];
};

interface ExpenseFormProps {
  initialData?: Expense;
  organizationId?: string;
  onSuccess: (data: Expense | ExpenseInput) => void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managerPopoverOpen, setManagerPopoverOpen] = useState(false);
  const { submitExpense, approveExpense } = useExpenseMutations();

  const isEdit = !!initialData;
  const expenseId = initialData?.id;

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
        attachments: item.attachments || [],
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
    getValues,
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const watchedManagerIds = watch("managerIds") || [];
  const watchedLineItems = watch("lineItems") || [];
  const watchedTotalAmount = watch("totalAmount") || 0;
  const isDraft = initialData?.state === EXPENSE_STATES.DRAFT;
  const hasLineItems = watchedLineItems.length > 0;

  // Calculate total amount from line items
  const calculatedTotal = watchedLineItems.reduce(
    (sum: number, item: any) => sum + (item.amount || 0),
    0
  );

  // Auto-fill function for total amount
  const handleAutoFill = React.useCallback(() => {
    setValue("totalAmount", calculatedTotal);
  }, [calculatedTotal, setValue]);

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
    setIsSubmitting(true);
    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/expenses/${expenseId}` : "/api/expenses";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalAmount: data.totalAmount || 0,
          managerIds: data.managerIds || [],
          lineItems: (data.lineItems || []).map((item) => ({
            amount: item.amount || 0,
            date: new Date(item.date).toISOString(),
            description: item.description,
            category: item.category,
            attachments: item.attachments || [],
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          isEdit
            ? "Expense updated successfully"
            : "Expense created successfully"
        );
        onSuccess(result);
      } else {
        throw new Error(`Failed to ${isEdit ? "update" : "create"} expense`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} expense`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (isEdit) {
      try {
        const result = await submitExpense.mutateAsync(expenseId!);
        toast.success("Expense submitted for pre-approval successfully");
        onSuccess(result);
      } catch (error) {
        console.error("Submit error:", error);
        toast.error("Failed to submit expense for pre-approval");
      }
    } else {
      // For new expenses, create with pre-approval status directly
      try {
        const data = getValues();
        const formattedData: any = {
          totalAmount: data.totalAmount || 0,
          managerIds: data.managerIds || [],
          lineItems: (data.lineItems || []).map((item) => ({
            amount: item.amount || 0,
            date: new Date(item.date).toISOString(),
            description: item.description || "",
            category: item.category || "",
            attachments: item.attachments || [],
          })),
          status: "pre-approval",
        };
        const response = await fetch("/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(
            "Expense created and submitted for pre-approval successfully"
          );
          onSuccess(result);
        } else {
          throw new Error("Failed to create expense");
        }
      } catch (error) {
        console.error("Submit error:", error);
        toast.error("Failed to create and submit expense for pre-approval");
      }
    }
  };

  const handleSubmitForFinalApproval = async () => {
    if (isEdit) {
      try {
        const result = await approveExpense.mutateAsync(expenseId!);
        toast.success("Expense approved successfully");
        onSuccess(result);
      } catch (error) {
        console.error("Approve error:", error);
        toast.error("Failed to approve expense");
      }
    } else {
      // For new expenses, create the expense first, then approve
      try {
        const data = getValues();
        const formattedData: any = {
          totalAmount: data.totalAmount || 0,
          managerIds: data.managerIds || [],
          lineItems: (data.lineItems || []).map((item) => ({
            amount: item.amount || 0,
            date: new Date(item.date).toISOString(),
            description: item.description || "",
            category: item.category || "",
            attachments: item.attachments || [],
          })),
          status: "approval-pending",
        };
        const response = await fetch("/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });
        if (response.ok) {
          const result = await response.json();
          toast.success("Expense created and approved successfully");
          const approveResult = await approveExpense.mutateAsync(result.id);
          onSuccess(approveResult);
        } else {
          throw new Error("Failed to create expense");
        }
      } catch (error) {
        console.error("Approve error:", error);
        toast.error("Failed to create and approve expense");
      }
    }
  };

  const addLineItem = () => {
    append({
      amount: undefined,
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "",
      attachments: [],
    });
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
            {initialData?.state === EXPENSE_STATES.PRE_APPROVED ||
            initialData?.state === EXPENSE_STATES.APPROVED ? (
              <div className="relative">
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={watchedTotalAmount.toFixed(2)}
                  readOnly
                  className="bg-muted/50 h-11"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Locked
                  </span>
                </div>
              </div>
            ) : (
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                {...register("totalAmount", { valueAsNumber: true })}
                className="h-11"
                placeholder=""
              />
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
            watchedManagerIds={watchedManagerIds}
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
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Calculated Total
                </Label>
                <p className="text-sm text-muted-foreground">
                  Based on {fields.length} line item
                  {fields.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right space-y-2">
                <div className="text-3xl font-bold">
                  ${calculatedTotal.toFixed(2)}
                </div>
                {calculatedTotal !== watchedTotalAmount && (
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
            hasLineItems={hasLineItems}
            isSubmitting={isSubmitting}
            submitExpensePending={submitExpense.isPending}
            approveExpensePending={approveExpense.isPending}
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
