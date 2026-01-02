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
    </div>
  );
}
