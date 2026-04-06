"use client";

import { useMemo, useState } from "react";
import { useExpenses } from "@/hooks/use-expenses";
import { useOrganization } from "@/hooks/use-organization";
import { useIsManager } from "@/hooks/use-is-manager";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { useSession } from "@/lib/auth-client";
import { ExpenseListCard } from "@/components/expenses/expense-list-card";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import { isPrivateExpense } from "@/lib/utils/expense-display";
import type { Expense } from "@/types/expense";
import { ErrorState } from "@/components/shared/error-state";
import { ExpenseListSkeleton } from "@/components/expenses/expense-list-card-skeleton";
import { DashboardFab } from "@/app/dashboard/_components/dashboard-fab";

// --- Icons ---
const IconSearch = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const IconLock = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconBriefcase = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconInbox = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const IconUser = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function ExpensesPage() {
  const { data: session } = useSession();
  const { data: organization, isLoading: orgLoading } = useOrganization();
  const { data: isManager, isLoading: managerLoading } = useIsManager();
  const { data: orgMembers } = useOrganizationMembers(organization?.id || "");

  // Determine if user is solo (no organization)
  const isSoloUser = !orgLoading && !organization;

  // --- UI STATE ---
  // User preference for context (only used when user has org)
  const [userContextPreference, setUserContextPreference] = useState<
    "vault" | "work"
  >("work");
  const [workView, setWorkView] = useState<"inbox" | "mine">("inbox");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Compute active context: solo users always see vault, org users can toggle
  const activeContext = isSoloUser ? "vault" : userContextPreference;

  // Fetch expenses based on context
  const {
    data: expensesData,
    isLoading: expensesLoading,
    error: expensesError,
    refetch,
  } = useExpenses({
    page,
    limit: 20,
    search: search || undefined,
    type: activeContext === "vault" ? "private" : "org",
  });

  // Create employee name map from organization members
  const employeeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (orgMembers?.members) {
      orgMembers.members.forEach((member) => {
        if (member.user) {
          map.set(
            member.user.id,
            member.user.name || member.user.email || "Unknown User"
          );
        }
      });
    }
    return map;
  }, [orgMembers]);

  // Filter expenses based on context, view, and role
  const filteredExpenses = useMemo(() => {
    if (!expensesData?.expenses) return [];

    let filtered = expensesData.expenses;

    if (activeContext === "vault") {
      // Vault: Only show private expenses
      filtered = filtered.filter((expense) => isPrivateExpense(expense));
    } else if (activeContext === "work") {
      // Work: Only show non-private expenses
      filtered = filtered.filter((expense) => !isPrivateExpense(expense));

      // Manager inbox view: Only show expenses pending approval where current user is assigned manager
      if (isManager && workView === "inbox") {
        filtered = filtered.filter(
          (expense) =>
            (expense.state === EXPENSE_STATES.APPROVAL_PENDING ||
              expense.state === EXPENSE_STATES.PRE_APPROVAL_PENDING) &&
            expense.managerIds.includes(session?.user?.id || "")
        );
      } else if (isManager && workView === "mine") {
        // Manager "My Claims": Show their own expenses (where they are the owner)
        filtered = filtered.filter(
          (expense) => expense.userId === session?.user?.id
        );
      } else if (!isManager) {
        // Employee work view: Only show their own expenses (not expenses where they're managers)
        filtered = filtered.filter(
          (expense) => expense.userId === session?.user?.id
        );
      }
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((expense) => {
        // Search in merchant/description
        const merchant = expense.lineItems[0]?.description || "";
        if (merchant.toLowerCase().includes(searchLower)) return true;

        // Search in category
        const category = expense.lineItems[0]?.category || "";
        if (category.toLowerCase().includes(searchLower)) return true;

        // Search in employee name (for manager inbox)
        if (activeContext === "work" && isManager && workView === "inbox") {
          const employeeName =
            employeeNameMap.get(expense.userId) || "";
          if (employeeName.toLowerCase().includes(searchLower)) return true;
        }

        return false;
      });
    }

    return filtered;
  }, [
    expensesData,
    activeContext,
    isManager,
    workView,
    search,
    employeeNameMap,
    session?.user?.id,
  ]);

  // Count pending approvals for manager inbox badge (before search filtering)
  const pendingCount = useMemo(() => {
    if (!isManager || activeContext !== "work" || workView !== "inbox") {
      return 0;
    }
    if (!expensesData?.expenses) return 0;
    
    // Count from all expenses, not filtered ones
    return expensesData.expenses.filter(
      (expense) =>
        !isPrivateExpense(expense) &&
        (expense.state === EXPENSE_STATES.APPROVAL_PENDING ||
          expense.state === EXPENSE_STATES.PRE_APPROVAL_PENDING) &&
        expense.managerIds.includes(session?.user?.id || "")
    ).length;
  }, [expensesData, isManager, activeContext, workView, session?.user?.id]);

  const isLoading = expensesLoading || orgLoading || managerLoading;
  const error = expensesError;

  // Get section header text
  const getSectionHeader = () => {
    if (activeContext === "vault") return "Private Storage";
    if (activeContext === "work" && isManager && workView === "inbox")
      return "Needs Approval";
    if (activeContext === "work" && isManager && workView === "mine")
      return "My History";
    if (activeContext === "work" && !isManager) return "My Claims";
    if (activeContext === "work") return "My Claims";
    return "Expenses";
  };

  // Get search placeholder
  const getSearchPlaceholder = () => {
    if (activeContext === "vault") return "Search personal...";
    return "Search business...";
  };

  return (
    <div className="min-h-screen font-sans pb-24">
      {/* --- HEADER --- */}
      <div className="border-b">
        <div className="space-y-4 pb-4 pt-2">
          {/* 1. TITLE / SWITCHER AREA */}
          <div className="flex justify-center relative">
            {/* SCENARIO A: SOLO USER (Static Title) */}
            {isSoloUser ? (
              <div className="flex items-center gap-2 text-xl font-bold text-[#121110]">
                <div className="w-8 h-8 bg-[#FF8A65] rounded-lg flex items-center justify-center text-white shadow-md shadow-orange-200">
                  <IconLock className="w-4 h-4" />
                </div>
                My Vault
              </div>
            ) : (
              // SCENARIO B: ORG USER (The Toggle)
              <div className="bg-white p-1.5 rounded-full border border-zinc-200 shadow-sm flex relative">
                <button
                  onClick={() => {
                    setUserContextPreference("vault");
                    setPage(1);
                  }}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                    activeContext === "vault"
                      ? "bg-[#FF8A65] text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  <IconLock className="w-4 h-4" /> Personal
                </button>
                <button
                  onClick={() => {
                    setUserContextPreference("work");
                    if (isManager) setWorkView("inbox");
                    setPage(1);
                  }}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                    activeContext === "work"
                      ? "bg-[#121110] text-white shadow-md"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  <IconBriefcase className="w-4 h-4" /> Work
                </button>
              </div>
            )}
          </div>

          {/* 2. SUB-NAV (Only for Managers in Work Mode) */}
          {!isSoloUser && activeContext === "work" && isManager && (
            <div className="flex justify-start border-b border-zinc-100">
              <button
                onClick={() => {
                  setWorkView("inbox");
                  setPage(1);
                }}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
                  workView === "inbox"
                    ? "border-[#121110] text-[#121110]"
                    : "border-transparent text-zinc-400"
                }`}
              >
                <IconInbox className="w-4 h-4" /> Inbox
                {pendingCount > 0 && (
                  <span className="bg-[#D0FC42] text-[#121110] text-[10px] px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setWorkView("mine");
                  setPage(1);
                }}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
                  workView === "mine"
                    ? "border-[#121110] text-[#121110]"
                    : "border-transparent text-zinc-400"
                }`}
              >
                <IconUser className="w-4 h-4" /> My Claims
              </button>
            </div>
          )}

          {/* 3. SEARCH */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[#121110] focus:ring-1 focus:ring-[#121110] shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- LIST CONTENT --- */}
      <div className="space-y-3 pb-6 pt-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-2 mb-2">
          {getSectionHeader()}
        </h3>

        {isLoading ? (
          <ExpenseListSkeleton count={5} />
        ) : error ? (
          <div className="bg-white p-8 text-center rounded-[1.25rem] border border-zinc-200 shadow-sm">
            <ErrorState
              message="Failed to load expenses. Please try again."
              type="inline"
              onRetry={() => refetch()}
            />
          </div>
        ) : filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense: Expense) => (
            <ExpenseListCard
              key={expense.id}
              expense={expense}
              showEmployeeName={
                activeContext === "work" && isManager && workView === "inbox"
              }
              employeeName={employeeNameMap.get(expense.userId)}
            />
          ))
        ) : (
          <div className="text-center py-20 opacity-50">
            <p className="font-bold text-zinc-400">Nothing here yet</p>
          </div>
        )}
      </div>

      <DashboardFab />
    </div>
  );
}
