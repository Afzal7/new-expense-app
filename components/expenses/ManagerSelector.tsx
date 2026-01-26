"use client";

import { Search, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import type { OrganizationWithMembers } from "@/hooks/use-organization-members";

const ACCENT_COLOR = "#D0FC42";

// Color palette for avatars (matching dummy design)
const AVATAR_COLORS = [
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-yellow-100", text: "text-yellow-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
];

const getAvatarColor = (index: number) => {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
};

const ManagerCombobox = ({
  organization,
  selectedManagerIds,
  onSelectionChange,
}: {
  organization: OrganizationWithMembers | null | undefined;
  selectedManagerIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) => {
  const [search, setSearch] = useState("");

  const handleSelection = (managerId: string) => {
    // Single-select: replace current selection with the clicked manager
    // Since we're single-select, array will only have 0 or 1 item
    const isCurrentlySelected = selectedManagerIds.length > 0 && selectedManagerIds[0] === managerId;
    const newSelection = isCurrentlySelected ? [] : [managerId];
    onSelectionChange(newSelection);
  };

  // Filter to only show owners and admins (not regular members)
  const managersOnly = (organization?.members || []).filter(
    (member) => member.role === "owner" || member.role === "admin"
  );

  const filteredMembers = managersOnly.filter((member) =>
    member.user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search approver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-muted border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      {filteredMembers.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {search 
            ? `No managers found matching "${search}"`
            : "No owners or admins available"}
        </p>
      )}
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
        {filteredMembers.map((member, index) => {
          // Single-select: check if this manager is the selected one
          const isSelected = selectedManagerIds.length > 0 && selectedManagerIds[0] === member.user.id;
          const initials = member.user.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          const avatarColor = getAvatarColor(index);
          const roleLabel = member.role === "owner" ? "Owner" : member.role === "admin" ? "Admin" : "Member";

          return (
            <button
              key={member.user.id}
              onClick={() => handleSelection(member.user.id)}
              className={`flex items-center gap-3 p-2 rounded-xl border transition-all text-left group ${
                isSelected
                  ? "bg-primary border-primary text-primary-foreground shadow-md"
                  : "bg-card border-border text-foreground hover:border-muted-foreground/30"
              }`}
            >
              <div
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : `${avatarColor.bg} ${avatarColor.text}`
                }`}
              >
                {initials}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{member.user.name}</div>
                <div
                  className={`text-[10px] ${
                    isSelected ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {roleLabel}
                </div>
              </div>
              {isSelected && (
                <Check className="w-5 h-5 text-[#D0FC42] pr-2" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface ManagerSelectorProps {
  organization: OrganizationWithMembers | null | undefined;
  watchedManagerIds: string[];
  onSelectionChange: (ids: string[]) => void;
  errors?: {
    managerIds?: {
      message?: string;
    };
  };
  isLoading?: boolean;
}

export function ManagerSelector({
  organization,
  watchedManagerIds,
  onSelectionChange,
  errors,
  isLoading,
}: ManagerSelectorProps) {
  // Show loading state only in the manager selector (child component)
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <div className="w-full bg-muted border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold">
            <div className="h-5 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ManagerCombobox
        organization={organization}
        selectedManagerIds={watchedManagerIds}
        onSelectionChange={onSelectionChange}
      />
      {errors?.managerIds && (
        <p className="text-sm text-destructive">{errors.managerIds.message}</p>
      )}
    </div>
  );
}
