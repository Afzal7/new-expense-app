"use client";

import React, { useState, useCallback } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  XIcon,
  Send,
  ChevronDownIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Upload, File } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { toast } from "sonner";
import type { Expense, ExpenseInput } from "@/types/expense";
import { LineItemForm } from "./line-item-form";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";

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

const expenseFormSchema = z.object({
  totalAmount: z.number().min(0.01, "Total amount must be greater than 0"),
  managerIds: z
    .array(z.string())
    .min(1, "At least one manager must be selected"),
  lineItems: z.array(lineItemSchema),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ManagerComboboxProps {
  organization: any;
  selectedManagerIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const ManagerCombobox = ({
  organization,
  selectedManagerIds,
  onSelectionChange,
}: ManagerComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleSelection = (value: string) => {
    const newSelection = selectedManagerIds.includes(value)
      ? selectedManagerIds.filter((id) => id !== value)
      : [...selectedManagerIds, value];
    onSelectionChange(newSelection);
  };

  const removeSelection = (value: string) => {
    onSelectionChange(selectedManagerIds.filter((id) => id !== value));
  };

  const maxShownItems = 2;
  const visibleItems = expanded
    ? selectedManagerIds
    : selectedManagerIds.slice(0, maxShownItems);
  const hiddenCount = selectedManagerIds.length - visibleItems.length;

  const availableMembers =
    organization?.members?.filter(
      (member: any) => !selectedManagerIds.includes(member.user.id)
    ) || [];

  return (
    <div className="w-full space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-8 w-full justify-between hover:bg-transparent"
          >
            <div className="flex flex-wrap items-center gap-1 pr-2.5">
              {selectedManagerIds.length > 0 ? (
                <>
                  {visibleItems.map((managerId) => {
                    const member = organization?.members?.find(
                      (m: any) => m.user.id === managerId
                    );
                    return member ? (
                      <Badge
                        key={managerId}
                        variant="outline"
                        className="rounded-sm"
                      >
                        {member.user.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelection(managerId);
                          }}
                          asChild
                        >
                          <span>
                            <XIcon className="size-3" />
                          </span>
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                  {hiddenCount > 0 || expanded ? (
                    <Badge
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((prev) => !prev);
                      }}
                      className="rounded-sm"
                    >
                      {expanded ? "Show Less" : `+${hiddenCount} more`}
                    </Badge>
                  ) : null}
                </>
              ) : (
                <span className="text-muted-foreground">Select managers</span>
              )}
            </div>
            <ChevronsUpDownIcon
              className="text-muted-foreground/80 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
          <Command>
            <CommandInput placeholder="Search managers..." />
            <CommandList>
              <CommandEmpty>No managers found.</CommandEmpty>
              <CommandGroup>
                {organization?.members?.map((member: any) => (
                  <CommandItem
                    key={member.user.id}
                    value={member.user.name}
                    onSelect={() => toggleSelection(member.user.id)}
                  >
                    <span className="truncate">{member.user.name}</span>
                    {selectedManagerIds.includes(member.user.id) && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface ExpenseActionButtonGroupProps {
  isEdit: boolean;
  isDraft: boolean;
  hasLineItems: boolean;
  isSubmitting: boolean;
  submitExpensePending: boolean;
  approveExpensePending: boolean;
  onSubmit: () => void;
  onSubmitForApproval: () => void;
  onSubmitForFinalApproval: () => void;
  onCancel: () => void;
}

const approvalOptions = [
  {
    label: "Submit for Pre-approval",
    description: "Submit the expense for initial review and pre-approval",
    action: "pre-approval",
  },
  {
    label: "Submit for Final Approval",
    description: "Submit the expense for final approval and processing",
    action: "final-approval",
  },
];

const ExpenseActionButtonGroup = ({
  isEdit,
  isDraft,
  hasLineItems,
  isSubmitting,
  submitExpensePending,
  approveExpensePending,
  onSubmit,
  onSubmitForApproval,
  onSubmitForFinalApproval,
  onCancel,
}: ExpenseActionButtonGroupProps) => {
  const [selectedAction, setSelectedAction] = useState("pre-approval");

  const selectedOption = approvalOptions.find(
    (option) => option.action === selectedAction
  );

  const handleSubmitAction = () => {
    switch (selectedAction) {
      case "pre-approval":
        onSubmitForApproval();
        break;
      case "final-approval":
        onSubmitForFinalApproval();
        break;
    }
  };

  const isPending =
    selectedAction === "pre-approval"
      ? submitExpensePending
      : approveExpensePending;

  const isDisabled = !hasLineItems || isPending;

  return (
    <div className="flex items-center gap-4">
      {/* Save as Draft Button */}
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? "Saving..." : "Save as Draft"}
      </Button>

      {/* Button Group for Approval Options */}
      <div className="divide-primary-foreground/30 inline-flex w-fit divide-x rounded-md shadow-xs">
        <Button
          type="button"
          className="rounded-none rounded-l-md focus-visible:z-10"
          disabled={isDisabled}
          onClick={handleSubmitAction}
        >
          {isPending ? "Processing..." : selectedOption?.label}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="rounded-none rounded-r-md focus-visible:z-10"
              disabled={!hasLineItems}
            >
              <ChevronDownIcon />
              <span className="sr-only">Select action</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            sideOffset={4}
            align="end"
            className="max-w-64 md:max-w-xs"
          >
            <DropdownMenuRadioGroup
              value={selectedAction}
              onValueChange={setSelectedAction}
            >
              {approvalOptions.map((option) => (
                <DropdownMenuRadioItem
                  key={option.action}
                  value={option.action}
                  className="items-start [&>span]:pt-1.5"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {option.description}
                    </span>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cancel Button */}
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
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
  const { data: session } = useSession();
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
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      totalAmount: initialData?.totalAmount || undefined,
      managerIds: initialData?.managerIds || [],
      lineItems:
        initialData?.lineItems?.map((item) => ({
          amount: item.amount || undefined,
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
    getValues,
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const watchedManagerIds = watch("managerIds");
  const isDraft = initialData?.state === EXPENSE_STATES.DRAFT;
  const hasLineItems = (watch("lineItems") || []).length > 0;

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
          managerIds: data.managerIds,
          lineItems: data.lineItems.map((item) => ({
            amount: item.amount || 0,
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
          managerIds: data.managerIds,
          lineItems: data.lineItems.map((item) => ({
            amount: item.amount || 0,
            date: new Date(item.date).toISOString(),
            description: item.description || "",
            category: item.category || "",
            attachments: item.attachments,
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
          toast.success("Expense created and submitted for pre-approval successfully");
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
          managerIds: data.managerIds,
          lineItems: data.lineItems.map((item) => ({
            amount: item.amount || 0,
            date: new Date(item.date).toISOString(),
            description: item.description || "",
            category: item.category || "",
            attachments: item.attachments,
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
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "",
      attachments: [],
    });
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Expense" : "Create Expense"}
          </h2>
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
            <ManagerCombobox
              organization={organization}
              selectedManagerIds={watchedManagerIds}
              onSelectionChange={(ids) => setValue("managerIds", ids)}
            />
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
      </form>
    </FormProvider>
  );
}
