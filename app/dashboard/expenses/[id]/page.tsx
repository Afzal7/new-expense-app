"use client";

import { AuditLog } from "@/components/expenses/audit-log";
import { LineItemRow } from "@/components/expenses/line-item-row";
import { ManagerSelector } from "@/components/expenses/ManagerSelector";
import { StatusBadge } from "@/components/expenses/status-badge";
import { StatusDrawer } from "@/components/expenses/status-drawer";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { useExpense } from "@/hooks/use-expenses";
import { useIsManager } from "@/hooks/use-is-manager";
import { useOrganization } from "@/hooks/use-organization";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { useSession } from "@/lib/auth-client";
import { getStateConfig } from "@/lib/constants/expense-state-config";
import { isPrivateExpense } from "@/lib/utils/expense-display";
import type { ExpenseState } from "@/lib/constants/expense-states";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import { toast } from "@/lib/toast";
import {
    ArrowLeft,
    Building,
    ChevronUp,
    Lock,
    Pen,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = useSession();

  const { data: expense, isLoading, error, refetch } = useExpense(id);
  const {
    updateExpense,
    changeExpenseStatus,
  } = useExpenseMutations();

  // Check if current user is a manager (admin/owner)
  const { data: isAdmin } = useIsManager();

  // Get organization for manager selection
  const { data: organization } = useOrganization();
  const { data: organizationWithMembers, isLoading: orgMembersLoading } =
    useOrganizationMembers(organization?.id || "");

  // UI State
  const [showStatusDrawer, setShowStatusDrawer] = useState(false);
  const [showManagerSheet, setShowManagerSheet] = useState(false);
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);

  // Authorization check: User can view expense if they are:
  // 1. The expense owner, OR
  // 2. An assigned manager, OR
  // 3. An org admin (for org expenses)
  const isAuthorized =
    !isLoading &&
    !error &&
    expense &&
    (session?.user?.id === expense.userId ||
      expense.managerIds?.includes(session?.user?.id || "") ||
      isAdmin);

  // State calculations (vault = no org linkage and no approvers; matches list/cards)
  const isPrivate = expense ? isPrivateExpense(expense) : false;
  const isLocked = expense
    ? (expense.state === EXPENSE_STATES.APPROVED ||
        expense.state === EXPENSE_STATES.REIMBURSED ||
        expense.state === EXPENSE_STATES.PRE_APPROVED)
    : false;
  const isEditable = isPrivate || (!isPrivate && !isLocked);
  const isManager = isAdmin || false;
  const isEmployee = session?.user?.id === expense?.userId;

  const handleStatusChange = async (newState: ExpenseState) => {
    if (!expense) return;

    // Prevent users from approving their own expenses
    const isExpenseOwner = session?.user?.id === expense.userId;
    const isApprovalAction =
      newState === EXPENSE_STATES.APPROVED ||
      newState === EXPENSE_STATES.PRE_APPROVED;

    if (isApprovalAction && isExpenseOwner) {
      toast.error("You cannot approve your own expense");
      return;
    }

    try {
      await changeExpenseStatus.mutateAsync({
        id: expense.id,
        status: newState,
      });
    } catch (error) {
      console.error("Status change failed:", error);
    }
  };

  const handleSubmitToOrg = async () => {
    if (!expense || selectedManagerIds.length === 0) {
      toast.error("Please select at least one manager");
      return;
    }

    try {
      await updateExpense.mutateAsync({
        id: expense.id,
        expenseInput: {
          totalAmount: expense.totalAmount,
          managerIds: selectedManagerIds,
          lineItems: expense.lineItems.map((item) => ({
            amount: item.amount,
            date: new Date(item.date),
            description: item.description,
            category: item.category,
            attachments: item.attachments,
          })),
        },
      });
      setShowManagerSheet(false);
      setSelectedManagerIds([]);
      toast.success("Expense submitted to organization");
      // Refetch expense to get updated organizationId
      await refetch();
    } catch (error) {
      console.error("Submit to org failed:", error);
    }
  };

  const handleWithdrawRequest = async () => {
    if (!expense) return;

    try {
      // Clear managerIds to make expense private again
      await updateExpense.mutateAsync({
        id: expense.id,
        expenseInput: {
          totalAmount: expense.totalAmount,
          managerIds: [],
          lineItems: expense.lineItems.map((item) => ({
            amount: item.amount,
            date: new Date(item.date),
            description: item.description,
            category: item.category,
            attachments: item.attachments,
          })),
        },
      });
      toast.success("Expense withdrawn from organization");
      // Refetch expense to get updated organizationId
      await refetch();
    } catch (error) {
      console.error("Withdraw request failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-2xl">
          <div className="space-y-6">
            <LoadingSkeleton type="card" count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            message="Failed to load expense details. Please try again."
            type="page"
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-2xl">
          <ErrorState
            message="You don't have permission to view this expense."
            type="page"
            onRetry={() => router.back()}
            retryLabel="Go Back"
          />
        </div>
      </div>
    );
  }

  const statusConfig = getStateConfig(expense.state);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-40">
      <div className="mx-auto w-full max-w-2xl space-y-6 pt-3">
        {/* Back + context + status */}
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/expenses")}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted active:bg-muted"
              aria-label="Back to expenses"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {isPrivate ? (
              <div className="flex min-w-0 items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Lock className="h-4 w-4 shrink-0" aria-hidden />
                <span>Personal Vault</span>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Building className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">
                  {organization?.name || "Organization"}
                </span>
              </div>
            )}
          </div>
          {!isPrivate && (
            <div className="shrink-0">
              <StatusBadge state={expense.state} />
            </div>
          )}
        </div>

        {/* 2. HERO TOTAL */}
        <div className="text-center">
          <div className="text-muted-foreground font-bold text-sm mb-1">
            Total Amount
          </div>
          <div className="font-mono font-bold text-6xl tracking-tighter text-foreground">
            ${expense.totalAmount.toFixed(2)}
          </div>
        </div>

        {/* 3. LINE ITEMS LIST */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
            Receipts & Items
          </h3>
          <div className="space-y-3">
            {expense.lineItems.length > 0 ? (
              expense.lineItems.map((item, index) => (
                <LineItemRow key={index} item={item} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No line items
              </div>
            )}
          </div>
        </div>

        {/* 4. AUDIT LOG (Only visible in Org Context) */}
        {!isPrivate && (
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1 mb-4">
              History
            </h3>
            <AuditLog logs={expense.auditLog} />
          </div>
        )}
      </div>

      {/* --- FOOTER LOGIC: The "Brain" of the Page --- */}

      {/* SCENARIO 1: MANAGER VIEW */}
      {!isPrivate && isManager && (
        <>
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-6 sm:px-6 z-40 safe-area-pb">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              {/* Current Status Readout */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bg} ${statusConfig.color}`}
                >
                  <statusConfig.icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {statusConfig.label}
                  </div>
                </div>
              </div>

              {/* Trigger for State Drawer */}
              <button
                onClick={() => setShowStatusDrawer(true)}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
              >
                Change <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STATUS DRAWER */}
          <StatusDrawer
            open={showStatusDrawer}
            onOpenChange={setShowStatusDrawer}
            currentState={expense.state}
            onStateChange={handleStatusChange}
          />
        </>
      )}

      {/* SCENARIO 2: EMPLOYEE VIEW */}
      {isEmployee && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-6 sm:px-6 z-40 safe-area-pb">
          <div className="max-w-2xl mx-auto">
            {isEditable ? (
              // Case A: Actionable Footer
              <div className="grid grid-cols-2 gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-auto min-h-14 w-full bg-card border-2 border-border py-4 text-foreground rounded-2xl font-bold text-sm hover:bg-muted active:scale-[0.98] transition-all"
                >
                  <Link
                    href={`/dashboard/expenses/${expense.id}/edit`}
                    className="flex items-center justify-center gap-2"
                  >
                    <Pen className="h-5 w-5 shrink-0" aria-hidden />
                    Edit
                  </Link>
                </Button>

                {isPrivate ? (
                  <button
                    type="button"
                    onClick={() => setShowManagerSheet(true)}
                    className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    Submit to Org
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleWithdrawRequest}
                    className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-4 text-sm font-bold text-destructive transition-all hover:bg-destructive/10 active:scale-[0.98]"
                  >
                    Withdraw Request
                  </button>
                )}
              </div>
            ) : (
              // Case B: Read-Only Status Footer
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                >
                  <statusConfig.icon className="w-4 h-4" strokeWidth={2.5} />
                  {statusConfig.label} - Read Only
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manager Selection Sheet for Submit to Org */}
      {showManagerSheet && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm animate-in fade-in"
            onClick={() => {
              setShowManagerSheet(false);
              setSelectedManagerIds([]);
            }}
          />

          {/* Sheet Content */}
          <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[2.5rem] px-4 pt-6 pb-12 sm:px-6 z-50 animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
            <div className="max-w-xl mx-auto">
              <div className="flex justify-center -mt-2 mb-6">
                <div className="w-12 h-1.5 bg-border rounded-full" />
              </div>
              <h3 className="text-lg font-bold mb-6 px-2 text-foreground">
                Select Manager
              </h3>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                {organizationWithMembers ? (
                  <>
                    <ManagerSelector
                      organization={organizationWithMembers}
                      watchedManagerIds={selectedManagerIds}
                      onSelectionChange={setSelectedManagerIds}
                      errors={undefined}
                      isLoading={orgMembersLoading}
                    />
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowManagerSheet(false);
                          setSelectedManagerIds([]);
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitToOrg}
                        disabled={
                          selectedManagerIds.length === 0 ||
                          updateExpense.isPending
                        }
                        className="flex-[2]"
                      >
                        {updateExpense.isPending ? "Submitting..." : "Submit to Org"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {orgMembersLoading
                      ? "Loading managers..."
                      : "No organization found. Please create or join an organization first."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
