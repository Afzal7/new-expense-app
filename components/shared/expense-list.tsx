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
  /** Additional filters specific to the context */
  additionalFilters?: {
    /** Filter by expense state */
    state?: Expense["state"];
    /** Filter by organization vs private */
    type?: "all" | "private" | "org";
    /** Include deleted expenses */
    includeDeleted?: boolean;
  };
  /** Show/hide certain columns */
  showColumns?: {
    employee?: boolean;
    organization?: boolean;
    actions?: boolean;
  };
  /** Custom actions for each expense row */
  renderActions?: (expense: Expense) => React.ReactNode;
}

export function ExpenseList({
  routePrefix = "/dashboard/expenses",
  additionalFilters = {},
  showColumns = {
    employee: true,
    organization: true,
    actions: true,
  },
  renderActions,
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
      filtered = filtered.filter(
        (expense) => expense.state === additionalFilters.state
      );
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
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {showColumns.employee && <TableHead>Employee</TableHead>}
              {showColumns.organization && <TableHead>Type</TableHead>}
              {showColumns.actions && (
                <TableHead className="w-24">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
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
