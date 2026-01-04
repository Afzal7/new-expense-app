"use client";

import { ErrorState } from "@/components/shared/error-state";
import { ExpenseCard } from "@/components/shared/expense-card";
import { ExpenseCardSkeleton } from "@/components/shared/expense-card-skeleton";
import { ExpenseEmptyState } from "@/components/shared/expense-empty-state";
import { ExpenseTabControls } from "@/components/shared/expense-tab-controls";
import { useExpenses } from "@/hooks/use-expenses";
import { useOrganization } from "@/hooks/use-organization";
import type { Expense } from "@/types/expense";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- Icons ---
const IconPlus = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
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

export default function ExpensesPage() {
  const { data: organization, isLoading: orgLoading } = useOrganization();

  const [activeTab, setActiveTab] = useState("work");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Set default tab based on organization availability
  useEffect(() => {
    if (!orgLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(organization ? "work" : "personal");
    }
  }, [orgLoading, organization]);

  const {
    data: expensesData,
    isFetching: isLoading,
    error,
    refetch,
  } = useExpenses({
    page,
    limit: 20,
    search: search || undefined,
    type: activeTab === "work" ? "org" : "private",
  });

  // if (orgLoading) {
  //   return <LoadingSkeleton type="list" count={5} />;
  // }

  // if (orgError || !organization) {
  //   return (
  //     <ErrorState
  //       message="Unable to load organization. Please ensure you have an organization set up."
  //       type="page"
  //       onRetry={() => window.location.reload()}
  //     />
  //   );
  // }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when changing tabs
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#121110] font-sans pb-24">
      {/* Mobile Tab Controls */}

      <div className="">
        {/* Desktop Header (Hidden on Mobile) */}
        <div className="hidden md:flex flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Expenses</h1>
            <p className="text-zinc-500">
              Manage your spend across two worlds.
            </p>
          </div>
          <Link href="/dashboard/expenses/create">
            <button className="bg-[#121110] text-white pl-4 pr-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
              <div className="bg-[#FF8A65] p-1 rounded-full text-white">
                <IconPlus className="w-4 h-4" />
              </div>
              New Expense
            </button>
          </Link>
        </div>

        <div className="sticky top-14 z-30 bg-[#FDF8F5]/80 backdrop-blur-md border-b border-zinc-100/50 p-2 md:hidden">
          <ExpenseTabControls
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="mobile"
            hasOrganization={!!organization}
          />
        </div>

        {/* Desktop Controls (Hidden on Mobile) */}
        <div className="hidden md:flex flex-row gap-6 mb-8">
          <ExpenseTabControls
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="desktop"
            hasOrganization={!!organization}
          />
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <IconSearch className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-full py-3 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-[#FF8A65]/20 focus:border-[#FF8A65] transition-all font-medium placeholder:text-zinc-300"
            />
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="relative mb-6 md:hidden mt-4">
          <div className="absolute left-4 top-1/2 -translate-x-0 -translate-y-1/2 text-zinc-400">
            <IconSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none shadow-sm"
          />
        </div>

        {/* Content Area */}
        <div className="space-y-3 md:space-y-4">
          {isLoading ? (
            <>
              {/* Varied skeleton heights for more realistic loading */}
              <ExpenseCardSkeleton />
              <div className="bg-white p-4 md:p-5 rounded-[1.5rem] border border-zinc-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-zinc-100 rounded-2xl">
                  <div className="h-3 bg-zinc-200 rounded w-5 mb-1" />
                  <div className="h-4 bg-zinc-200 rounded w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                    <div className="h-5 bg-zinc-100 rounded w-56 md:w-72" />
                    <div className="hidden md:block h-6 bg-zinc-100 rounded-full w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-zinc-50 rounded w-16" />
                    <div className="h-3 bg-zinc-50 rounded w-24" />
                    <div className="md:hidden h-5 bg-zinc-100 rounded-full w-16" />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="h-6 bg-zinc-100 rounded w-24 mb-1" />
                  <div className="hidden md:flex h-3 bg-zinc-50 rounded w-8" />
                </div>
              </div>
              <ExpenseCardSkeleton />
            </>
          ) : error ? (
            <div className="bg-white p-8 text-center rounded-[1.5rem] border border-zinc-100 shadow-sm">
              <ErrorState
                message="Failed to load expenses. Please try again."
                type="inline"
                onRetry={() => refetch()}
              />
            </div>
          ) : !expensesData?.expenses || expensesData.expenses.length === 0 ? (
            <ExpenseEmptyState tab={activeTab} onRefresh={() => refetch()} />
          ) : (
            expensesData.expenses.map((expense: Expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))
          )}
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <Link href="/dashboard/expenses/create">
        <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#121110] text-white rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center active:scale-90 transition-transform z-50">
          <IconPlus className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
}
