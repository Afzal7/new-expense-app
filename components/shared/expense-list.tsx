"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Receipt,
  Eye,
  Building2,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CheckSquare,
  Square,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExpenses } from "@/hooks/use-expenses";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { useOrganization } from "@/hooks/use-organization";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import type { Expense } from "@/types/expense";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";

interface ExpenseListProps {
  /** Route prefix for navigation (e.g., "/dashboard/expenses") */
  routePrefix?: string;
  /** Display variant - 'table' for traditional table layout, 'cards' for card-based feed layout */
  variant?: "table" | "cards";
  /** Additional filters specific to the context */
  additionalFilters?: {
    /** Filter by expense state (single state or array of states) */
    state?: Expense["state"] | Expense["state"][];
    /** Filter by organization vs private */
    type?: "all" | "private" | "org";
    /** Include deleted expenses */
    includeDeleted?: boolean;
  };
  /** Show/hide certain columns (table variant only) */
  showColumns?: {
    employee?: boolean;
    organization?: boolean;
    actions?: boolean;
  };
  /** Custom actions for each expense row/card */
  renderActions?: (expense: Expense) => React.ReactNode;
  /** Selection functionality */
  selection?: {
    /** Currently selected expense IDs */
    selectedIds: Set<string>;
    /** Callback when an expense is selected/deselected */
    onSelectExpense: (expenseId: string, selected: boolean) => void;
    /** Callback when select all is toggled */
    onSelectAll: (expenses: Expense[]) => void;
  };
}

export function ExpenseList({
  routePrefix = "/dashboard/expenses",
  variant = "table",
  additionalFilters = {},
  showColumns = {
    employee: true,
    organization: true,
    actions: true,
  },
  renderActions,
  selection,
}: ExpenseListProps) {
  const router = useRouter();
  const { data: organization } = useOrganization();
  const { data: membersData } = useOrganizationMembers(organization?.id || "");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  const {
    data: expensesData,
    isLoading,
    error,
    refetch,
  } = useExpenses({
    page,
    limit: 20,
    search: search || undefined,
    type: additionalFilters.type || "all",
    includeDeleted: additionalFilters.includeDeleted,
  });

  // Filter expenses by state if specified
  const filteredExpenses = useMemo(() => {
    if (!expensesData?.expenses) return [];

    let filtered = expensesData.expenses;

    // Filter by state if specified
    if (additionalFilters.state) {
      const states = Array.isArray(additionalFilters.state)
        ? additionalFilters.state
        : [additionalFilters.state];
      filtered = filtered.filter((expense) => states.includes(expense.state));
    }

    // Filter by employee if specified
    if (employeeFilter !== "all") {
      filtered = filtered.filter(
        (expense) => expense.userId === employeeFilter
      );
    }

    return filtered;
  }, [expensesData?.expenses, additionalFilters.state, employeeFilter]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleEmployeeFilterChange = (value: string) => {
    setEmployeeFilter(value);
    setPage(1); // Reset to first page when filtering
  };

  const getExpenseTitle = (expense: Expense) => {
    // Try to get a meaningful title from the first line item
    const firstItem = expense.lineItems[0];
    if (firstItem?.description) {
      return firstItem.description.length > 50
        ? `${firstItem.description.substring(0, 50)}...`
        : firstItem.description;
    }

    // Fall back to categories if available
    const categories = expense.lineItems
      .map((item) => item.category)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index); // unique

    if (categories.length > 0) {
      return categories.join(", ");
    }

    // Final fallback
    return `Expense #${expense.id.slice(-8)}`;
  };

  const getStatusBadge = (state: Expense["state"]) => {
    const statusConfig = {
      [EXPENSE_STATES.APPROVED]: {
        variant: "default" as const,
        icon: CheckCircle,
        className:
          "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800",
      },
      [EXPENSE_STATES.REJECTED]: {
        variant: "destructive" as const,
        icon: XCircle,
        className: "",
      },
      [EXPENSE_STATES.PRE_APPROVAL_PENDING]: {
        variant: "secondary" as const,
        icon: Clock,
        className:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
      },
      [EXPENSE_STATES.APPROVAL_PENDING]: {
        variant: "secondary" as const,
        icon: AlertCircle,
        className:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
      },
      [EXPENSE_STATES.DRAFT]: {
        variant: "outline" as const,
        icon: Clock,
        className: "",
      },
      [EXPENSE_STATES.PRE_APPROVED]: {
        variant: "secondary" as const,
        icon: CheckCircle,
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
      },
      [EXPENSE_STATES.REIMBURSED]: {
        variant: "default" as const,
        icon: CheckCircle,
        className:
          "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800",
      },
    };

    const config = statusConfig[state] || statusConfig[EXPENSE_STATES.DRAFT];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {state}
      </Badge>
    );
  };

  const getEmployeeName = (userId: string) => {
    if (!membersData?.members) return "Unknown User";

    const member = membersData.members.find((m) => m.id === userId);
    return member?.user?.name || "Unknown User";
  };

  if (isLoading) {
    return <LoadingSkeleton type="list" count={5} />;
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load expenses. Please try again."
        type="inline"
        onRetry={() => refetch()}
      />
    );
  }

  if (!filteredExpenses || filteredExpenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses found"
        description={
          search || employeeFilter !== "all"
            ? "Try adjusting your search or filters."
            : "No expenses match the current criteria."
        }
        action={
          !search && employeeFilter === "all"
            ? {
                label: "Create Expense",
                onClick: () => router.push(`${routePrefix}/create`),
              }
            : undefined
        }
      />
    );
  }

  // Cards variant rendering
  if (variant === "cards") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl xl:max-w-4xl">
          {/* Filters */}
          <div className="mb-6">
            {/* Search - Subtle and clean */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:shadow-lg focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all duration-200 text-sm placeholder:text-slate-400"
              />
            </div>

            {/* Employee Filter */}
            {showColumns.employee &&
              membersData?.members &&
              membersData.members.length > 0 && (
                <Select
                  value={employeeFilter}
                  onValueChange={handleEmployeeFilterChange}
                >
                  <SelectTrigger className="h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm">
                    <User className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {membersData.members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 animate-pulse"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-8 text-center">
              <ErrorState
                message="Failed to load expenses. Please try again."
                type="inline"
                onRetry={() => refetch()}
              />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredExpenses.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No expenses found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {search || employeeFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "No expenses match the current criteria."}
              </p>
            </div>
          )}

          {/* Expense Cards */}
          {!isLoading && !error && filteredExpenses.length > 0 && (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <Link
                  key={expense.id}
                  href={`${routePrefix}/${expense.id}`}
                  className="block"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] p-6">
                    {/* Top row - Title and amount */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white truncate mb-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
                          {getExpenseTitle(expense)}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          {showColumns.employee && (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {getEmployeeName(expense.userId)}
                                </span>
                              </div>
                              <span>•</span>
                            </>
                          )}
                          <div className="flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5" />
                            <span>
                              {expense.lineItems.length} item
                              {expense.lineItems.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                          ${expense.totalAmount.toFixed(2)}
                        </div>
                        {showColumns.organization && expense.organizationId ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-full">
                            <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                              Org
                            </span>
                          </div>
                        ) : showColumns.organization ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
                            <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              Private
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Status and actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(expense.state)}
                      </div>
                      {renderActions && showColumns.actions && (
                        <div
                          className="flex gap-2"
                          onClick={(e) => e.preventDefault()}
                        >
                          {renderActions(expense)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More */}
          {expensesData &&
            expensesData.totalPages > page &&
            filteredExpenses.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  className="h-9 px-6 rounded-2xl border-slate-200 dark:border-slate-700"
                >
                  Load More Expenses
                </Button>
              </div>
            )}

          {/* Results Summary */}
          {filteredExpenses.length > 0 && (
            <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
              Showing {filteredExpenses.length} of {expensesData?.total || 0}{" "}
              expenses
            </div>
          )}
        </div>
      </div>
    );
  }

  // Table variant rendering (original implementation)
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Employee Filter */}
        {showColumns.employee &&
          membersData?.members &&
          membersData.members.length > 0 && (
            <Select
              value={employeeFilter}
              onValueChange={handleEmployeeFilterChange}
            >
              <SelectTrigger className="w-full sm:w-48">
                <User className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {membersData.members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {selection && (
              <TableHead className="w-12">
                <button
                  onClick={() => selection.onSelectAll(filteredExpenses)}
                  className="flex items-center justify-center w-5 h-5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  {selection.selectedIds.size === filteredExpenses.length &&
                  filteredExpenses.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </TableHead>
            )}
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            {showColumns.employee && <TableHead>Employee</TableHead>}
            {showColumns.organization && <TableHead>Type</TableHead>}
            {showColumns.actions && (
              <TableHead className="w-24">Actions</TableHead>
            )}
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                {selection && (
                  <TableCell>
                    <button
                      onClick={() =>
                        selection.onSelectExpense(
                          expense.id,
                          !selection.selectedIds.has(expense.id)
                        )
                      }
                      className="flex items-center justify-center w-5 h-5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      {selection.selectedIds.has(expense.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </TableCell>
                )}
                <TableCell>
                  <Link
                    href={`${routePrefix}/${expense.id}`}
                    className="font-medium hover:underline"
                  >
                    {getExpenseTitle(expense)}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {expense.lineItems.length} item
                    {expense.lineItems.length !== 1 ? "s" : ""}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  ${expense.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell>{getStatusBadge(expense.state)}</TableCell>
                <TableCell>
                  {new Date(expense.createdAt).toLocaleDateString()}
                </TableCell>
                {showColumns.employee && (
                  <TableCell>{getEmployeeName(expense.userId)}</TableCell>
                )}
                {showColumns.organization && (
                  <TableCell>
                    {expense.organizationId ? (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                      >
                        <Building2 className="w-3 h-3 mr-1" />
                        Organization
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Shield className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </TableCell>
                )}
                {showColumns.actions && (
                  <TableCell>
                    {renderActions ? (
                      renderActions(expense)
                    ) : (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`${routePrefix}/${expense.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {expensesData && expensesData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} to{" "}
            {Math.min(page * 20, expensesData.total)} of {expensesData.total}{" "}
            expenses
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {expensesData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === expensesData.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
