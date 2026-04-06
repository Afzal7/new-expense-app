"use client";

import { CreditCard, DollarSign, Send } from "lucide-react";
import { useEffect, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { ManagerSelector } from "@/components/expenses/ManagerSelector";
import { Button } from "@/components/ui/button";
import type { OrganizationWithMembers } from "@/hooks/use-organization-members";

export type ExpenseSubmitToOrgType = "reimburse" | "preapproval";

const SUBMIT_TYPES = {
  REIMBURSE: "reimburse",
  PREAPPROVAL: "preapproval",
} as const satisfies Record<string, ExpenseSubmitToOrgType>;

interface ExpenseSubmitToOrgSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedManagerIds: string[];
  onManagerIdsChange: (ids: string[]) => void;
  organization: OrganizationWithMembers | null | undefined;
  orgLoading: boolean;
  orgError: unknown;
  /** When true, manager picker is omitted (e.g. personal-only flows). */
  isPersonal?: boolean;
  isSubmitting: boolean;
  onConfirm: (submitType: ExpenseSubmitToOrgType) => void | Promise<void>;
  /** Manager field errors from react-hook-form (optional). */
  managerErrors?: {
    managerIds?: { message?: string };
  };
}

export function ExpenseSubmitToOrgSheet({
  open,
  onOpenChange,
  selectedManagerIds,
  onManagerIdsChange,
  organization,
  orgLoading,
  orgError,
  isPersonal = false,
  isSubmitting,
  onConfirm,
  managerErrors,
}: ExpenseSubmitToOrgSheetProps) {
  const [submitType, setSubmitType] =
    useState<ExpenseSubmitToOrgType>(SUBMIT_TYPES.REIMBURSE);

  useEffect(() => {
    if (open) {
      setSubmitType(SUBMIT_TYPES.REIMBURSE);
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  const sendDisabled =
    isSubmitting ||
    isPersonal ||
    (!isPersonal && selectedManagerIds.length === 0);

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-in fade-in bg-black/40 backdrop-blur-sm duration-300"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-full rounded-t-[2.5rem] bg-card px-4 pb-10 pt-8 shadow-2xl duration-500 sm:px-6">
        <div className="mx-auto w-full max-w-xl space-y-8">
          <div className="-mt-2 mb-2 flex justify-center">
            <div className="h-1.5 w-12 rounded-full bg-muted" />
          </div>
          <h2 className="text-center text-2xl font-bold text-foreground">
            Submit to Organization
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSubmitType(SUBMIT_TYPES.REIMBURSE)}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${
                submitType === SUBMIT_TYPES.REIMBURSE
                  ? "border-primary bg-background ring-1 ring-primary"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
              aria-pressed={submitType === SUBMIT_TYPES.REIMBURSE}
            >
              <div
                className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full ${
                  submitType === SUBMIT_TYPES.REIMBURSE
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="text-sm font-bold text-foreground">
                Reimbursement
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                Get paid back
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSubmitType(SUBMIT_TYPES.PREAPPROVAL)}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${
                submitType === SUBMIT_TYPES.PREAPPROVAL
                  ? "border-primary bg-background ring-1 ring-primary"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
              aria-pressed={submitType === SUBMIT_TYPES.PREAPPROVAL}
            >
              <div
                className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full ${
                  submitType === SUBMIT_TYPES.PREAPPROVAL
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="text-sm font-bold text-foreground">
                Pre-approval
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                Get permission
              </div>
            </button>
          </div>

          {!isPersonal && (
            <ManagerSelector
              organization={organization}
              watchedManagerIds={selectedManagerIds}
              onSelectionChange={onManagerIdsChange}
              errors={managerErrors}
              isLoading={orgLoading}
            />
          )}
          {!isPersonal && orgError ? (
            <div className="mb-2">
              <ErrorState
                message="Failed to load organization members."
                type="inline"
                onRetry={() => window.location.reload()}
              />
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-[2] gap-2 rounded-xl"
              disabled={sendDisabled}
              onClick={async () => {
                await onConfirm(submitType);
              }}
            >
              <span>{isSubmitting ? "Sending..." : "Send request"}</span>
              {!isSubmitting ? (
                <Send className="h-4 w-4 shrink-0" aria-hidden />
              ) : null}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
