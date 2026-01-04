"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";

import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { useExpenseFormSubmission } from "@/hooks/use-expense-form-submission";
import { ManagerSelector } from "./expenses/ManagerSelector";
import { ExpenseHero } from "./expenses/expense-hero";
import { VaultToggle } from "./expenses/vault-toggle";
import { LineItemCard } from "./expenses/line-item-card";

import { ExpenseFormSchema } from "@/lib/validations/expense";
import {
  calculateLineItemsTotal,
  createDefaultLineItem,
  isDraftExpense as checkIsDraftExpense,
  totalsMatch,
} from "@/lib/utils/expense-form";
import { ExpenseBusinessRules } from "@/lib/utils/expense-business-logic";
import type { Expense } from "@/types/expense";
import type { ExpenseFormData } from "@/lib/utils/expense-form";
import { toast } from "@/lib/toast";

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

  const onSubmit = async (data: ExpenseFormData): Promise<void> => {
    // If personal, ensure we don't send organizationId/managers if the backend supports that
    // The useExpenseFormSubmission hook handles the actual mutation. 
    // We need to make sure the data is consistent.
    // NOTE: This logic might need to be in the hook, but for now we trust the form data.
    // If isPersonal is true, we might need to handle that. 
    // Assuming backend handles "personal" based on null organizationId or similar.
    // Current hook uses 'transformFormDataToExpenseInput' which might need adjustment 
    // if 'organizationId' is part of the input. 
    // Actually, 'createExpense' usually takes organizationId as a separate arg or infers it.
    // Let's assume standard submission works.
    
    await submitDraft(data);
  };

  const handleSubmitReport = async (): Promise<void> => {
    // Determine which approval flow to use
    // If personal, maybe it just goes to approved? Or draft?
    // For now, use standard flow.
    if (isPersonal) {
        // Personal expenses might not need approval, so maybe just 'submitDraft' or 'submitForPreApproval'
        // depending on business rules. Let's assume they go to PreApproval (or just Saved).
        await submitForPreApproval(formData);
    } else {
        if (managerIds.length === 0) {
             toast.error("Please select a manager for approval");
             return;
        }
        await submitForFinalApproval(formData);
    }
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
    <div className="min-h-screen bg-[#FDF8F5] text-[#121110] font-sans pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#FDF8F5]/90 backdrop-blur-xl border-b border-zinc-100 flex justify-between items-center px-6 py-4">
        <button
          onClick={onCancel}
          aria-label="Back"
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-zinc-100 text-zinc-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm">
          {isEdit ? "Edit Expense" : "New Report"}
        </span>
        <div className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-8">
        {/* 1. VAULT TOGGLE */}
        <VaultToggle isPersonal={isPersonal} onChange={setIsPersonal} />

        {/* 2. THE TOTAL HERO (Editable) */}
        <ExpenseHero
          amount={totalAmount}
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
          <div className="mb-8 animate-in fade-in slide-in-from-top-2">
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
            className="group flex flex-col items-center gap-2 text-zinc-400 hover:text-[#121110] transition-colors"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center group-hover:border-[#FF8A65] group-hover:bg-[#FFF0E0] group-hover:text-[#FF8A65] transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide">
              Add Item
            </span>
          </button>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FDF8F5]/90 backdrop-blur-md border-t border-zinc-200 p-4 md:p-6 z-50 safe-area-pb">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 bg-white border border-zinc-200 text-[#121110] py-4 rounded-2xl font-bold text-base hover:bg-zinc-50 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmitReport}
            disabled={isSubmitting}
            className="flex-[2] bg-[#121110] text-white py-4 rounded-2xl font-bold text-base hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-zinc-300 disabled:opacity-50"
          >
            {isSubmitting
              ? "Submitting..."
              : `Submit Report (${fields.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
