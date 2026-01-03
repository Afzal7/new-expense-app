"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ExpenseBusinessRules } from "@/lib/utils/expense-business-logic";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
interface ExpenseActionButtonGroupProps {
  isEdit: boolean;
  isDraft: boolean;
  hasLineItems: boolean;
  isSubmitting: boolean;
  submitExpensePending: boolean;
  approveExpensePending: boolean;
  expense?: any; // The expense object for business rule checks
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

export function ExpenseActionButtonGroup({
  isEdit,
  isDraft,
  hasLineItems,
  isSubmitting,
  submitExpensePending,
  approveExpensePending,
  expense,
  onSubmit,
  onSubmitForApproval,
  onSubmitForFinalApproval,
  onCancel,
}: ExpenseActionButtonGroupProps) {
  // Determine available approval options based on business rules
  const canSubmitForPreApproval =
    ExpenseBusinessRules.canSubmitForPreApproval(expense);
  const canSubmitForFinalApproval =
    ExpenseBusinessRules.canSubmitForFinalApproval(expense);

  const availableOptions = approvalOptions.filter((option) => {
    if (option.action === "pre-approval") return canSubmitForPreApproval;
    if (option.action === "final-approval") return canSubmitForFinalApproval;
    return true;
  });

  const [selectedAction, setSelectedAction] = useState(
    availableOptions.length > 0 ? availableOptions[0].action : "pre-approval"
  );

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

  // If no approval options are available, only show save draft
  if (availableOptions.length === 0) {
    return (
      <div className="flex flex-col gap-3 pt-4 border-t lg:flex-row lg:gap-3">
        <div className="flex gap-3 lg:gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 lg:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="flex-1 lg:flex-none shadow-sm"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground flex items-center">
          No approval options available for current expense state
        </div>
      </div>
    );
  }

  // If only one option is available, show a single button
  if (availableOptions.length === 1) {
    const option = availableOptions[0];
    return (
      <div className="flex flex-col gap-3 pt-4 border-t lg:flex-row lg:gap-3">
        <div className="flex gap-3 lg:gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 lg:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="flex-1 lg:flex-none shadow-sm"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
        </div>

        <Button
          type="button"
          variant="default"
          disabled={isDisabled}
          onClick={handleSubmitAction}
          className="flex-1 lg:flex-none shadow-sm"
        >
          {isPending ? "Processing..." : option.label}
        </Button>
      </div>
    );
  }

  // Multiple options available - show dropdown
  return (
    <div className="flex flex-col gap-3 pt-4 border-t lg:flex-row lg:gap-3">
      <div className="flex gap-3 lg:gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="flex-1 lg:flex-none"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="flex-1 lg:flex-none shadow-sm"
        >
          {isSubmitting ? "Saving..." : "Save Draft"}
        </Button>
      </div>

      <div className="divide-primary-foreground/30 inline-flex w-fit divide-x rounded-md shadow-xs">
        <Button
          type="button"
          variant="default"
          disabled={isDisabled}
          onClick={handleSubmitAction}
          className="rounded-none rounded-l-md focus-visible:z-10"
        >
          {isPending
            ? "Processing..."
            : approvalOptions.find((o) => o.action === selectedAction)?.label}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              disabled={isDisabled}
              className="rounded-none rounded-r-md focus-visible:z-10"
            >
              <ChevronDown />
              <span className="sr-only">Select submit option</span>
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
              {availableOptions.map((option) => (
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
    </div>
  );
}
