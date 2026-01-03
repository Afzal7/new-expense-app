/**
 * Example usage of the ExpenseList component in different contexts
 */

import { ExpenseList } from "@/components/shared/expense-list";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import type { Expense } from "@/types/expense";

// 1. Basic usage for employee expenses
export function EmployeeExpenses() {
  return (
    <ExpenseList
      routePrefix="/dashboard/expenses"
      showColumns={{
        employee: false, // Hide employee column since it's all the current user's expenses
        organization: true,
        actions: true,
      }}
    />
  );
}

// 2. Manager approval view
export function ManagerApprovals() {
  return (
    <ExpenseList
      routePrefix="/dashboard/approvals"
      additionalFilters={{
        state: "Approval Pending",
        type: "org", // Only organization expenses
      }}
      showColumns={{
        employee: true,
        organization: false, // All are org expenses
        actions: true,
      }}
      renderActions={(expense) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="destructive">
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      )}
    />
  );
}

// 3. Finance reimbursement view
export function FinanceReimbursements() {
  return (
    <ExpenseList
      routePrefix="/dashboard/finance"
      additionalFilters={{
        state: "Approved",
        type: "all",
      }}
      showColumns={{
        employee: true,
        organization: true,
        actions: true,
      }}
      renderActions={(expense) => (
        <Button size="sm" variant="outline">
          Mark as Reimbursed
        </Button>
      )}
    />
  );
}

// 4. Organization admin view (all expenses)
export function AdminExpenseOverview() {
  return (
    <ExpenseList
      routePrefix="/dashboard/admin/expenses"
      additionalFilters={{
        type: "org",
        includeDeleted: true,
      }}
      showColumns={{
        employee: true,
        organization: false, // All are org expenses
        actions: true,
      }}
    />
  );
}
