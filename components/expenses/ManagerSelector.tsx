"use client";

import { Label } from "@/components/ui/label";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useState } from "react";

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

interface ManagerSelectorProps {
  organization: any;
  watchedManagerIds: string[];
  onSelectionChange: (ids: string[]) => void;
  errors: any;
}

export function ManagerSelector({
  organization,
  watchedManagerIds,
  onSelectionChange,
  errors,
}: ManagerSelectorProps) {
  return (
    <div>
      <Label>Managers</Label>
      <div className="space-y-2">
        <ManagerCombobox
          organization={organization}
          selectedManagerIds={watchedManagerIds}
          onSelectionChange={onSelectionChange}
        />
      </div>
      {errors.managerIds && (
        <p className="text-red-500 text-sm">{errors.managerIds.message}</p>
      )}
    </div>
  );
}
