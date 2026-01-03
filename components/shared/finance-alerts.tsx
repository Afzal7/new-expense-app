"use client";

import { AlertTriangle, Clock, CheckCircle, DollarSign } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useExpenses } from "@/hooks/use-expenses";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";

interface FinanceAlertsProps {
  className?: string;
}

export function FinanceAlerts({ className = "" }: FinanceAlertsProps) {
  const router = useRouter();

  // Get all expenses and filter them client-side
  const { data: allExpenses } = useExpenses({
    limit: 1000, // Get a large number to analyze
  });

  const approvedExpenses =
    allExpenses?.expenses?.filter(
      (expense) => expense.state === EXPENSE_STATES.APPROVED
    ) || [];

  const preApprovalPendingExpenses =
    allExpenses?.expenses?.filter(
      (expense) => expense.state === EXPENSE_STATES.PRE_APPROVAL_PENDING
    ) || [];

  const approvalPendingExpenses =
    allExpenses?.expenses?.filter(
      (expense) => expense.state === EXPENSE_STATES.APPROVAL_PENDING
    ) || [];

  const pendingReimbursements = approvedExpenses.length;
  const preApprovalPending = preApprovalPendingExpenses.length;
  const approvalPending = approvalPendingExpenses.length;

  // Calculate overdue items (expenses older than 30 days that are approved but not reimbursed)
  const overdueReimbursements = approvedExpenses.filter((expense) => {
    const approvedDate = new Date(expense.updatedAt || expense.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return approvedDate < thirtyDaysAgo;
  }).length;

  const alerts = [];

  // High priority: Overdue reimbursements
  if (overdueReimbursements > 0) {
    alerts.push({
      type: "destructive" as const,
      icon: AlertTriangle,
      title: `${overdueReimbursements} Overdue Reimbursement${overdueReimbursements > 1 ? "s" : ""}`,
      description: `Approved expenses over 30 days old need immediate attention.`,
      action: "Process Now",
      onClick: () => router.push("/dashboard/finance/reimbursements"),
    });
  }

  // Medium priority: Pending reimbursements
  if (pendingReimbursements > 0 && overdueReimbursements === 0) {
    alerts.push({
      type: "default" as const,
      icon: DollarSign,
      title: `${pendingReimbursements} Expense${pendingReimbursements > 1 ? "s" : ""} Ready for Reimbursement`,
      description: `Approved expenses are waiting to be processed.`,
      action: "Process Reimbursements",
      onClick: () => router.push("/dashboard/finance/reimbursements"),
    });
  }

  // Low priority: Workflow bottlenecks
  if (preApprovalPending > 5) {
    alerts.push({
      type: "default" as const,
      icon: Clock,
      title: `${preApprovalPending} Expenses Awaiting Pre-Approval`,
      description: `Consider following up with managers on pending pre-approvals.`,
      action: "View All Expenses",
      onClick: () => router.push("/dashboard/expenses"),
    });
  }

  if (approvalPending > 5) {
    alerts.push({
      type: "default" as const,
      icon: Clock,
      title: `${approvalPending} Expenses Awaiting Final Approval`,
      description: `Final approvals are needed to move expenses to reimbursement.`,
      action: "View Approvals",
      onClick: () => router.push("/dashboard/manager/approvals"),
    });
  }

  // Success message when everything is processed
  if (alerts.length === 0 && pendingReimbursements === 0) {
    alerts.push({
      type: "default" as const,
      icon: CheckCircle,
      title: "All Caught Up!",
      description: `No pending reimbursements or approvals at this time.`,
      action: null,
      onClick: null,
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {alerts.map((alert, index) => (
        <Alert key={index} variant={alert.type} className="relative">
          <alert.icon className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            {alert.title}
            {alert.type === "destructive" && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {alert.description}
            {alert.action && alert.onClick && (
              <Button
                variant="link"
                className="p-0 h-auto ml-1 text-primary hover:underline"
                onClick={alert.onClick}
              >
                {alert.action}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ))}

      {/* Summary stats */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm">
            <strong>{pendingReimbursements}</strong> Ready for Reimbursement
          </span>
        </div>
        {overdueReimbursements > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm">
              <strong>{overdueReimbursements}</strong> Overdue
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm">
            <strong>{preApprovalPending + approvalPending}</strong> In Approval
            Process
          </span>
        </div>
      </div>
    </div>
  );
}
