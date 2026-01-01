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

interface ApprovalOption {
  label: string;
  description: string;
  action: string;
  variant?: "default" | "destructive";
}

interface ApprovalButtonGroupProps {
  options: ApprovalOption[];
  onAction: (action: string) => void;
  disabled?: boolean;
}

const ApprovalButtonGroup = ({
  options,
  onAction,
  disabled = false,
}: ApprovalButtonGroupProps) => {
  const [selectedIndex, setSelectedIndex] = useState("0");

  const selectedOption = options[Number(selectedIndex)];

  const handleSubmit = () => {
    onAction(selectedOption.action);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="divide-primary-foreground/30 inline-flex w-fit divide-x rounded-md shadow-xs">
        <Button
          className="rounded-none rounded-l-md focus-visible:z-10"
          variant={selectedOption.variant || "default"}
          disabled={disabled}
        >
          {selectedOption.label}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="rounded-none rounded-r-md focus-visible:z-10"
              variant={selectedOption.variant || "default"}
              disabled={disabled}
            >
              <ChevronDownIcon />
              <span className="sr-only">Select option</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            sideOffset={4}
            align="end"
            className="max-w-64 md:max-w-xs!"
          >
            <DropdownMenuRadioGroup
              value={selectedIndex}
              onValueChange={setSelectedIndex}
            >
              {options.map((option, index) => (
                <DropdownMenuRadioItem
                  key={option.label}
                  value={String(index)}
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
      <Button onClick={handleSubmit} disabled={disabled}>
        Submit
      </Button>
    </div>
  );
};

export default ApprovalButtonGroup;
