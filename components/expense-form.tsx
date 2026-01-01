"use client";

import { useState, useCallback } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Upload,
  File,
  Save,
  CheckCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { toast } from "sonner";
import type { Expense, ExpenseInput } from "@/types/expense";
import { LineItemForm } from "./line-item-form";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

const lineItemSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  date: z
    .string()
    .refine(
      (date) => !isNaN(Date.parse(date)) && new Date(date) <= new Date(),
      {
        message: "Date cannot be in the future",
      }
    ),
  description: z.string().optional(),
  category: z.string().optional(),
  attachments: z.array(z.string()),
});

const expenseFormSchema = z
  .object({
    totalAmount: z.number().min(0.01, "Total amount must be greater than 0"),
    managerIds: z
      .array(z.string())
      .min(1, "At least one manager must be selected"),
    lineItems: z.array(lineItemSchema),
  })
  .refine(
    (data) => {
      if (data.lineItems && data.lineItems.length > 0) {
        const sum = data.lineItems.reduce((acc, item) => acc + item.amount, 0);
        return Math.abs(sum - data.totalAmount) < 0.01;
      }
      return true;
    },
    {
      message: "Total amount must match sum of line items",
      path: ["totalAmount"],
    }
  );

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

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
  const { data: session } = useSession();
  const {
    data: organization,
    isLoading: orgLoading,
    error: orgError,
  } = useOrganizationMembers(organizationId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(
    initialData?.id || null
  );
  const { submitExpense } = useExpenseMutations();

  const isEdit = !!initialData;
  const expenseId = initialData?.id || draftId;

  const formMethods = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      totalAmount: initialData?.totalAmount || 0,
      managerIds: initialData?.managerIds || [],
      lineItems:
        initialData?.lineItems?.map((item) => ({
          amount: item.amount,
          date: new Date(item.date).toISOString().split("T")[0],
          description: item.description || "",
          category: item.category || "",
          attachments: item.attachments || [],
        })) || [],
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

  const watchedManagerIds = watch("managerIds");
  const isDraft = initialData?.state === EXPENSE_STATES.DRAFT;
  const hasLineItems = (watch("lineItems") || []).length > 0;

  // Auto-save functionality
  const saveDraft = useCallback(
    async (data: ExpenseInput) => {
      if (!session) return;

      try {
        let url: string;
        let method: string;

        if (draftId) {
          // Update existing draft
          url = `/api/expenses/${draftId}`;
          method = "PUT";
        } else {
          // Create new draft
          url = "/api/expenses";
          method = "POST";
        }

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${draftId ? "update" : "create"} draft`);
        }

        const result = await response.json();

        if (!draftId) {
          setDraftId(result.id);
        }
      } catch (error) {
        console.error("Draft save error:", error);
        throw error;
      }
    },
    [session, draftId]
  );

  const { status: autoSaveStatus } = useAutoSave({
    totalAmount: watch("totalAmount") || 0,
    managerIds: watch("managerIds") || [],
    lineItems: watch("lineItems") || [],
    onSave: saveDraft,
    debounceMs: 2000,
    enabled: !isEdit && !isSubmitting, // Only auto-save for new expenses, not edits
  });

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
          totalAmount: data.totalAmount,
          managerIds: data.managerIds,
          lineItems: data.lineItems.map((item) => ({
            amount: item.amount,
            date: new Date(item.date).toISOString(),
            description: item.description,
            category: item.category,
            attachments: item.attachments,
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
    if (!expenseId) return;

    try {
      const result = await submitExpense.mutateAsync(expenseId);
      toast.success("Expense submitted for pre-approval successfully");
      onSuccess(result);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit expense for pre-approval");
    }
  };

  const addLineItem = () => {
    append({
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "",
      attachments: [],
    });
  };

  const getAutoSaveIndicator = () => {
    if (isEdit) return null; // No auto-save for edits

    switch (autoSaveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Save className="h-4 w-4 animate-pulse" />
            Saving draft...
          </div>
        );
      case "saved":
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Draft saved
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            Failed to save draft
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Expense" : "Create Expense"}
            {!isEdit && draftId && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Draft)
              </span>
            )}
          </h2>
          {getAutoSaveIndicator()}
        </div>
        <div>
          <Label htmlFor="totalAmount">Total Amount</Label>
          <Input
            id="totalAmount"
            type="number"
            step="0.01"
            {...register("totalAmount", { valueAsNumber: true })}
          />
          {errors.totalAmount && (
            <p className="text-red-500 text-sm">{errors.totalAmount.message}</p>
          )}
        </div>

        <div>
          <Label>Managers</Label>
          <div className="space-y-2">
            <Select
              onValueChange={(value) => {
                if (!watchedManagerIds.includes(value)) {
                  setValue("managerIds", [...watchedManagerIds, value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add a manager" />
              </SelectTrigger>
              <SelectContent>
                {organization?.members
                  ?.filter(
                    (member) => !watchedManagerIds.includes(member.user.id)
                  )
                  ?.map((member) => (
                    <SelectItem key={member.user.id} value={member.user.id}>
                      {member.user.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {watchedManagerIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedManagerIds.map((managerId) => {
                  const member = organization?.members?.find(
                    (m) => m.user.id === managerId
                  );
                  return (
                    <Badge
                      key={managerId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {member?.user.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setValue(
                            "managerIds",
                            watchedManagerIds.filter((id) => id !== managerId)
                          )
                        }
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
          {errors.managerIds && (
            <p className="text-red-500 text-sm">{errors.managerIds.message}</p>
          )}
        </div>

        <div>
          <Button type="button" onClick={addLineItem} variant="outline">
            Add Line Item
          </Button>
        </div>

        {fields.map((field, index) => (
          <LineItemForm
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Expense"
                : "Create Expense"}
          </Button>
          {isEdit && isDraft && hasLineItems && (
            <Button
              type="button"
              onClick={handleSubmitForApproval}
              disabled={submitExpense.isPending}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {submitExpense.isPending ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Pre-Approval
                </>
              )}
            </Button>
          )}
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
