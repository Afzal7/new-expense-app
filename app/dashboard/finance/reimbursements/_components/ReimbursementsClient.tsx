"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  CheckSquare,
  Square,
  CheckCheck,
  Filter,
  Search,
  Users,
  Building2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExportControls } from "@/components/finance/export-controls";
import { ExpenseList } from "@/components/shared/expense-list";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import type { Expense } from "@/types/expense";
import { useIsFinanceManager } from "@/hooks/use-is-finance-manager";
import { ExpenseWorkflow } from "@/components/shared/expense-workflow";
import { FinanceOnboarding } from "@/components/shared/finance-onboarding";
import { FinanceAlerts } from "@/components/shared/finance-alerts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { useOrganization } from "@/hooks/use-organization";

export function ReimbursementsClient() {
  const { data: isFinanceManager, isLoading: roleLoading } =
    useIsFinanceManager();
  const { reimburseExpense, bulkReimburseExpenses } = useExpenseMutations();
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if onboarding was previously completed
    if (typeof window !== "undefined") {
      return !localStorage.getItem("finance-onboarding-completed");
    }
    return false;
  });

  const { data: currentOrg } = useOrganization();
  const { data: orgData } = useOrganizationMembers(currentOrg?.id || "");

  const members = orgData?.members || [];
  const organizations = Array.from(
    new Set(members.map((m) => m.organizationId).filter(Boolean))
  );

  const handleSelectExpense = (expenseId: string, selected: boolean) => {
    const newSelected = new Set(selectedExpenses);
    if (selected) {
      newSelected.add(expenseId);
    } else {
      newSelected.delete(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  const handleSelectAll = (expenses: Expense[]) => {
    if (selectedExpenses.size === expenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(expenses.map((e) => e.id)));
    }
  };

  const handleBulkReimburse = async () => {
    if (selectedExpenses.size === 0) return;

    try {
      await bulkReimburseExpenses.mutateAsync(Array.from(selectedExpenses));
      setSelectedExpenses(new Set()); // Clear selection after successful operation
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setEmployeeFilter("all");
    setOrgFilter("all");
    setMinAmount("");
    setMaxAmount("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    searchTerm ||
    employeeFilter !== "all" ||
    orgFilter !== "all" ||
    minAmount ||
    maxAmount ||
    dateFrom ||
    dateTo;

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isFinanceManager) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-12 w-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            You need finance manager permissions to access reimbursements.
          </p>
        </div>
      </div>
    );
  }

  const handleReimburse = async (expenseId: string) => {
    try {
      await reimburseExpense.mutateAsync(expenseId);
    } catch (_error) {
      // Error handled by mutation
    }
  };

  const renderActions = (expense: Expense) => (
    <div className="flex gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={() => handleReimburse(expense.id)}
        disabled={reimburseExpense.isPending}
        className="bg-green-600 hover:bg-green-700"
      >
        <DollarSign className="w-4 h-4 mr-1" />
        Reimburse
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Ready for Reimbursement
        </h1>
        <p className="text-muted-foreground">
          Process approved expenses that are ready for reimbursement.
        </p>
      </div>

      {showOnboarding && (
        <FinanceOnboarding
          onComplete={() => setShowOnboarding(false)}
          className="mb-6"
        />
      )}

      <FinanceAlerts className="mb-6" />

      <ExpenseWorkflow
        currentState={EXPENSE_STATES.APPROVED}
        className="mb-6"
      />

      <ExportControls />

      {/* Bulk Actions */}
      {selectedExpenses.size > 0 && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedExpenses.size} expense
              {selectedExpenses.size > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedExpenses(new Set())}
              className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              Clear Selection
            </Button>
            <Button
              size="sm"
              onClick={handleBulkReimburse}
              disabled={bulkReimburseExpenses.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Bulk Reimburse ({selectedExpenses.size})
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6">
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Advanced Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Employee Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                <Select
                  value={employeeFilter}
                  onValueChange={setEmployeeFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {members.map((member) => (
                      <SelectItem
                        key={member.id}
                        value={member.user?.email || member.id}
                      >
                        {member.user?.name || member.user?.email || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Organization Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization</label>
                <Select value={orgFilter} onValueChange={setOrgFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    <SelectItem value="private">Private Only</SelectItem>
                    <SelectItem value="org">Organization Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <ExpenseList
        routePrefix="/dashboard/finance/reimbursements"
        additionalFilters={{
          state: EXPENSE_STATES.APPROVED,
          // Note: Advanced filters are handled by the ExpenseList component's internal search/filtering
          // The ExpenseList uses useExpenses hook which already supports search and type filtering
        }}
        showColumns={{
          employee: true,
          organization: true,
          actions: true,
        }}
        renderActions={renderActions}
        selection={{
          selectedIds: selectedExpenses,
          onSelectExpense: handleSelectExpense,
          onSelectAll: handleSelectAll,
        }}
      />
    </div>
  );
}
