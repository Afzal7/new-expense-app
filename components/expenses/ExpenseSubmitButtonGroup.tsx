"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExpenseSubmitButtonGroupProps {
  onPreApproval: () => void;
  onFinalApproval: () => void;
  isSubmitting: boolean;
  lineItemCount: number;
  className?: string;
}

export function ExpenseSubmitButtonGroup({
  onPreApproval,
  onFinalApproval,
  isSubmitting,
  lineItemCount,
  className,
}: ExpenseSubmitButtonGroupProps) {
  const [selectedIndex, setSelectedIndex] = useState("0");

  const options = [
    {
      label: `Submit Report (${lineItemCount})`,
      description: "Submit full report with all line items for final approval.",
      action: onFinalApproval,
    },
    {
      label: "Submit for Pre-approval",
      description: "Only requires total amount and manager selection.",
      action: onPreApproval,
    },
  ];

  const handleMainAction = () => {
    options[Number(selectedIndex)].action();
  };

  return (
    <div className={`inline-flex w-full divide-x divide-primary-foreground/20 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <Button
        onClick={handleMainAction}
        disabled={isSubmitting}
        className="flex-[2] rounded-none bg-primary text-primary-foreground py-4 h-auto font-bold text-sm md:text-base hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : options[Number(selectedIndex)].label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            disabled={isSubmitting}
            className="rounded-none bg-primary text-primary-foreground py-4 h-auto w-12 hover:bg-primary/90 disabled:opacity-50 border-l border-primary-foreground/10"
          >
            <ChevronDownIcon className="h-4 w-4" />
            <span className="sr-only">Select submission option</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          sideOffset={8}
          align="end"
          className="max-w-64 md:max-w-xs bg-popover text-popover-foreground border border-border rounded-xl"
        >
          <DropdownMenuRadioGroup
            value={selectedIndex}
            onValueChange={setSelectedIndex}
          >
            {options.map((option, index) => (
              <DropdownMenuRadioItem
                key={option.label}
                value={String(index)}
                className="items-start [&>span]:pt-1.5 focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{option.label}</span>
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
  );
}
