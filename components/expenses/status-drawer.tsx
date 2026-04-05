"use client";

import { Check } from "lucide-react";
import { EXPENSE_STATES, type ExpenseState } from "@/lib/constants/expense-states";
import { getStateConfig } from "@/lib/constants/expense-state-config";

interface StatusDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentState: ExpenseState;
  onStateChange: (newState: ExpenseState) => void;
}

/**
 * StatusDrawer: Bottom sheet/drawer for manager status selection.
 * Lists all available states with icons and descriptions.
 */
export function StatusDrawer({
  open,
  onOpenChange,
  currentState,
  onStateChange,
}: StatusDrawerProps) {
  if (!open) return null;

  // Manager can change to any state except DRAFT
  const managerOptions: ExpenseState[] = [
    EXPENSE_STATES.APPROVAL_PENDING,
    EXPENSE_STATES.APPROVED,
    EXPENSE_STATES.REJECTED,
    EXPENSE_STATES.REIMBURSED,
    EXPENSE_STATES.PRE_APPROVAL_PENDING,
    EXPENSE_STATES.PRE_APPROVED,
  ];

  const handleStateSelect = (state: ExpenseState) => {
    onStateChange(state);
    onOpenChange(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet Content */}
      <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[2.5rem] p-6 z-50 animate-in slide-in-from-bottom-full duration-500 pb-12 shadow-2xl">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center -mt-2 mb-6">
            <div className="w-12 h-1.5 bg-border rounded-full" />
          </div>
          <h3 className="text-lg font-bold mb-6 px-2 text-foreground">
            Update Status
          </h3>

          {/* Scrollable List with Padding for Ring visibility */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1">
            {managerOptions.map((state) => {
              const config = getStateConfig(state);
              const Icon = config.icon;
              const isActive = currentState === state;

              return (
                <button
                  key={state}
                  onClick={() => handleStateSelect(state)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
                    ${
                      isActive
                        ? "bg-muted border-foreground ring-1 ring-foreground"
                        : "bg-card border-border hover:bg-muted"
                    }
                  `}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{config.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {config.description}
                    </div>
                  </div>
                  {isActive && (
                    <Check className="w-5 h-5 text-foreground" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
