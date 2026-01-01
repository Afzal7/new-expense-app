"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

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

export function ExpenseActionButtonGroup({
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
}: ExpenseActionButtonGroupProps) {
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
    <div className="flex items-center justify-end gap-3">
      {/* Cancel Button */}
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>

      {/* Save as Draft Button */}
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={onSubmit}
        className="shadow-sm"
      >
        {isSubmitting ? "Saving..." : "Save Draft"}
      </Button>

      {/* Submit for Approval */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Submit for:</span>
        <div className="inline-flex rounded-md shadow-sm">
          {approvalOptions.map((option) => (
            <Button
              key={option.action}
              type="button"
              variant={selectedAction === option.action ? "default" : "outline"}
              size="sm"
              disabled={isDisabled}
              onClick={() => {
                setSelectedAction(option.action);
                handleSubmitAction();
              }}
              className="rounded-none first:rounded-l-md last:rounded-r-md border-l-0 first:border-l"
            >
              {isPending && selectedAction === option.action
                ? "Processing..."
                : option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
