"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useExpenseFormSubmission } from "@/hooks/use-expense-form-submission";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { ExpenseSubmitButtonGroup } from "./expenses/ExpenseSubmitButtonGroup";
import { ManagerSelector } from "./expenses/ManagerSelector";
import { ExpenseHero } from "./expenses/expense-hero";
import { LineItemCard } from "./expenses/line-item-card";
import { VaultToggle } from "./expenses/vault-toggle";

import { toast } from "@/lib/toast";
import { ExpenseBusinessRules } from "@/lib/utils/expense-business-logic";
import type { ExpenseFormData } from "@/lib/utils/expense-form";
import {
  calculateLineItemsTotal,
  createDefaultLineItem,
} from "@/lib/utils/expense-form";
import { ExpenseFormSchema } from "@/lib/validations/expense";
import type { Expense } from "@/types/expense";

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
  // -- State --
  const [isPersonal, setIsPersonal] = useState(
    initialData ? !initialData.organizationId : false
  );
  const [expandedIndex, setExpandedIndex] = useState(0);

  // -- Hooks --
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
      managerIds: initialData?.managerIds || [],
      lineItems: initialData?.lineItems?.map((item) => ({
        amount: item.amount,
        date: new Date(item.date).toISOString().split("T")[0],
        description: item.description || "",
        category: item.category || "",
        attachments: item.attachments || [],
      })) || [createDefaultLineItem()],
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // Watch values
  const formData = watch();
  const lineItems = formData.lineItems || [];
  const totalAmount = formData.totalAmount || 0;
  const managerIds = formData.managerIds || [];

  // Calculations
  const calculatedTotal = useMemo(
    () => calculateLineItemsTotal(lineItems),
    [lineItems]
  );

  const canModifyTotal = ExpenseBusinessRules.canModifyTotalAmount(initialData);

  // -- Handlers --

  const onSaveDraft = async (): Promise<void> => {
    await submitDraft(formData);
  };

  const onPreApproval = async (): Promise<void> => {
    // Validation for Pre-approval: Total > 0 and Manager (if Work)
    if (!totalAmount || totalAmount <= 0) {
      toast.error("Total amount is required for pre-approval");
      return;
    }
    if (!isPersonal && managerIds.length === 0) {
      toast.error("Please select a manager for pre-approval");
      return;
    }
    await submitForPreApproval(formData);
  };

  const onFinalApproval = async (): Promise<void> => {
    // Validation for Final Approval: Everything + Line Items consistency
    if (!totalAmount || totalAmount <= 0) {
      toast.error("Total amount is required");
      return;
    }
    if (!isPersonal && managerIds.length === 0) {
      toast.error("Please select a manager for approval");
      return;
    }
    if (
      lineItems.length === 0 ||
      (lineItems.length === 1 && !lineItems[0].amount)
    ) {
      toast.error("At least one line item is required for final approval");
      return;
    }

    // Check if any line item is missing amount or date
    const incompleteItems = lineItems.some(
      (item) => !item.amount || !item.date
    );
    if (incompleteItems) {
      toast.error("Please complete all line items before submitting");
      return;
    }

    await submitForFinalApproval(formData);
  };

  const addLineItem = () => {
    append(createDefaultLineItem());
    setExpandedIndex(fields.length); // Expand the new item
  };

  const handleRemoveLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setExpandedIndex(Math.max(0, index - 1));
    } else {
      // If it's the last one, just reset it
      setValue(`lineItems.${0}`, createDefaultLineItem());
    }
  };

  // -- Render --

  if (orgLoading && !isPersonal) {
    return <LoadingSkeleton type="form" count={1} />;
  }

  // Only show error if we are in 'Work' mode and it failed
  if (orgError && !isPersonal) {
    return (
      <ErrorState
        message="Failed to load organization members."
        type="inline"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-48">
      {/* Sticky Header */}
      <div className="sticky top-13 z-40 bg-background/90 backdrop-blur-xl border-b border-border flex justify-between items-center">
        <button
          onClick={onCancel}
          aria-label="Back"
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-muted text-muted-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm">
          {isEdit ? "Edit Expense" : "New Report"}
        </span>
        <div className="w-10" />
      </div>

      <div className="max-w-4xl mx-auto pt-4">
        {/* 1. VAULT TOGGLE */}
        <VaultToggle isPersonal={isPersonal} onChange={setIsPersonal} />

        {/* 2. THE TOTAL HERO (Editable) */}
        <ExpenseHero
          amount={totalAmount || 0}
          onChange={(val) => setValue("totalAmount", val)}
          calculatedTotal={calculatedTotal}
          readOnly={!canModifyTotal}
        />
        {errors?.totalAmount && (
          <p className="text-sm text-destructive text-center -mt-8 mb-8">
            {errors.totalAmount.message}
          </p>
        )}

        {/* Manager Selector (Only for Work) */}
        {!isPersonal && organization && (
          <div className="px-2 mb-8 animate-in fade-in slide-in-from-top-2">
            <ManagerSelector
              organization={organization}
              watchedManagerIds={managerIds}
              onSelectionChange={(ids) => setValue("managerIds", ids)}
              errors={errors}
            />
          </div>
        )}

        {/* 3. LINE ITEM STACK */}
        <div className="space-y-4">
          {fields.map((field, i) => (
            <LineItemCard
              key={field.id}
              index={i}
              form={formMethods}
              remove={handleRemoveLineItem}
              expanded={expandedIndex === i}
              onExpand={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
            />
          ))}
        </div>

        {/* 4. ADD BUTTON */}
        <div className="mt-6 mb-12 flex justify-center">
          <button
            onClick={addLineItem}
            className="group flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group-hover:border-secondary group-hover:bg-secondary/10 group-hover:text-secondary transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide">
              Add Item
            </span>
          </button>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border p-4 md:p-6 z-50 safe-area-pb">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="flex-1 bg-card border border-border text-foreground py-4 rounded-2xl font-bold text-sm md:text-base hover:bg-muted active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
          >
            Save Draft
          </button>

          <ExpenseSubmitButtonGroup
            onPreApproval={onPreApproval}
            onFinalApproval={onFinalApproval}
            isSubmitting={isSubmitting}
            lineItemCount={fields.length}
            className="flex-[2]"
          />
        </div>
      </div>
    </div>
  );
}
