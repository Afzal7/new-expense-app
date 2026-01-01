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
}
