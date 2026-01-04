"use client";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

import { ExpenseWorkflow } from "@/components/shared/expense-workflow";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Shield,
  Receipt,
  Edit,
  MoreHorizontal,
  ChevronDown,
  Check,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { useExpense } from "@/hooks/use-expenses";
import { useSession } from "@/lib/auth-client";
import { useIsManager } from "@/hooks/use-is-manager";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import type { Expense, LineItem } from "@/types/expense";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = useSession();

  const { data: expense, isLoading, error } = useExpense(id);
  const { approveExpense, rejectExpense, reimburseExpense } =
    useExpenseMutations();

  // Check if current user is a manager (admin/owner)
  const { data: isAdmin } = useIsManager();

  const handleStatusChange = async (newStatus: string) => {
    if (!expense) return;

    // For now, we'll handle the main status transitions that have API support
    switch (newStatus) {
      case EXPENSE_STATES.APPROVED:
        if (expense.state === EXPENSE_STATES.APPROVAL_PENDING) {
          await approveExpense.mutateAsync(expense.id);
        }
        break;
      case EXPENSE_STATES.REJECTED:
        if (
          expense.state === EXPENSE_STATES.APPROVAL_PENDING ||
          expense.state === EXPENSE_STATES.PRE_APPROVAL_PENDING ||
          expense.state === EXPENSE_STATES.PRE_APPROVED
        ) {
          await rejectExpense.mutateAsync(expense.id);
        }
        break;
      case EXPENSE_STATES.REIMBURSED:
        if (expense.state === EXPENSE_STATES.APPROVED) {
          await reimburseExpense.mutateAsync(expense.id);
        }
        break;
      // Other status changes would require additional API endpoints
      default:
        console.log(
          `Status change to ${newStatus} requires additional API implementation`
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl xl:max-w-4xl">
          <div className="space-y-6">
            <LoadingSkeleton type="card" count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl xl:max-w-4xl">
          <ErrorState
            message="Failed to load expense details. Please try again."
            type="page"
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

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
      .map((item: LineItem) => item.category)
      .filter((category): category is string => Boolean(category))
      .filter(
        (value: string, index: number, self: string[]) =>
          self.indexOf(value) === index
      ); // unique

    if (categories.length > 0) {
      return categories.join(", ");
    }

    // Final fallback
    return `Expense #${expense.id.slice(-8)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case EXPENSE_STATES.DRAFT:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case EXPENSE_STATES.PRE_APPROVAL_PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case EXPENSE_STATES.PRE_APPROVED:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case EXPENSE_STATES.APPROVAL_PENDING:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case EXPENSE_STATES.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case EXPENSE_STATES.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case EXPENSE_STATES.REIMBURSED:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#121110] font-sans pb-24 safe-area-pb">
      {/* Sticky Mobile Header */}
      <div className="sticky top-0 z-40 bg-[#FDF8F5]/90 backdrop-blur-md border-b border-zinc-100 flex justify-between items-center px-6 py-4 md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-zinc-100 text-zinc-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-bold text-sm">Expense Details</span>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full active:bg-zinc-100 text-zinc-600 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        {/* Desktop Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="hidden md:flex items-center gap-2 text-zinc-500 hover:text-[#121110] font-bold text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Button>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* LEFT COL: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-zinc-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <div className="inline-block px-3 py-1 bg-[#F0FDF4] text-emerald-600 border border-emerald-100 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3">
                    {expense.state === "Approved"
                      ? "Approved"
                      : expense.state.replace("-", " ")}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-[#121110]">
                    {getExpenseTitle(expense)}
                  </h1>
                </div>
                <div className="text-left md:text-right mt-2 md:mt-0">
                  <div className="text-zinc-400 text-xs md:text-sm font-medium mb-1">
                    Total Amount
                  </div>
                  <div className="font-mono text-3xl md:text-4xl font-bold tracking-tighter text-[#121110]">
                    ${expense.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Desktop Action Bar */}
              <div className="hidden md:flex gap-3 border-t border-zinc-100 pt-6">
                {/* Edit button - only for expense owner before approval */}
                {!expense.deletedAt && session?.user?.id === expense.userId && (
                  <Button
                    asChild
                    variant="ghost"
                    className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold py-3 rounded-xl text-sm transition-colors border border-zinc-200"
                  >
                    <Link href={`/dashboard/expenses/${expense.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                )}

                {/* Status dropdown - only for admins */}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={`justify-between font-medium ${getStatusColor(expense.state)} ${approveExpense.isPending || rejectExpense.isPending || reimburseExpense.isPending ? "opacity-50" : ""}`}
                        disabled={
                          approveExpense.isPending ||
                          rejectExpense.isPending ||
                          reimburseExpense.isPending
                        }
                      >
                        <span className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              expense.state === EXPENSE_STATES.APPROVED
                                ? "bg-green-500"
                                : expense.state === EXPENSE_STATES.REJECTED
                                  ? "bg-red-500"
                                  : expense.state === EXPENSE_STATES.REIMBURSED
                                    ? "bg-indigo-500"
                                    : "bg-current opacity-60"
                            }`}
                          />
                          {getStatusLabel(expense.state)}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm font-medium text-gray-500 border-b">
                        Change Status
                      </div>
                      {Object.values(EXPENSE_STATES)
                        .filter((status) => status !== expense.state)
                        .map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  status === EXPENSE_STATES.APPROVED
                                    ? "bg-green-500"
                                    : status === EXPENSE_STATES.REJECTED
                                      ? "bg-red-500"
                                      : status === EXPENSE_STATES.REIMBURSED
                                        ? "bg-indigo-500"
                                        : "bg-gray-400"
                                }`}
                              />
                              {getStatusLabel(status)}
                            </span>
                            {status === expense.state && (
                              <Check className="w-4 h-4" />
                            )}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-zinc-400" /> Line Items
                </h3>

                <div className="space-y-6">
                  {expense.lineItems.map((item: LineItem, i: number) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row gap-4 border-b border-zinc-50 last:border-0 pb-6 last:pb-0"
                    >
                      {/* Icon & Details */}
                      <div className="flex gap-4 flex-1">
                        <div className="w-12 h-12 bg-[#FDF8F5] rounded-xl flex-shrink-0 flex items-center justify-center text-xl border border-zinc-100">
                          {item.category === "Travel"
                            ? "✈️"
                            : item.category === "Lodging"
                              ? "🏨"
                              : "💼"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-[#121110]">
                                {item.description || "No description"}
                              </div>
                              <div className="text-sm text-zinc-500">
                                {new Date(item.date).toLocaleDateString()} •{" "}
                                {item.category}
                              </div>
                            </div>
                            <div className="font-mono font-bold text-lg md:hidden block">
                              ${item.amount.toFixed(2)}
                            </div>
                          </div>

                          {/* Attachments Area */}
                          {item.attachments && item.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.attachments.map(
                                (url: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="w-12 h-12 bg-zinc-100 rounded-xl"
                                  ></div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop Amount */}
                      <div className="hidden md:block text-right">
                        <div className="font-mono font-bold text-lg">
                          ${item.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL: Meta & History */}
          <div className="space-y-6">
            {/* Audit Log Card */}
            <div className="bg-white rounded-[2rem] p-6 border border-zinc-200 shadow-sm">
              <h3 className="font-bold text-lg mb-6">Activity</h3>
              <div className="relative border-l-2 border-zinc-100 ml-3 space-y-8 py-2">
                {[...expense.auditLog].reverse().map((log, i) => (
                  <div key={i} className="relative pl-6 md:pl-8">
                    <div
                      className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${log.action === "created" ? "bg-zinc-300" : "bg-[#D0FC42]"}`}
                    />
                    <div className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      {new Date(log.date).toLocaleDateString()} •{" "}
                      {new Date(log.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="font-bold text-sm text-[#121110]">
                      {log.action === "created" && "Expense Draft Created"}
                      {log.action === "submitted" && "Submitted for Approval"}
                      {log.action === "approved" && "Approved by Manager"}
                      {log.action === "rejected" && "Rejected by Manager"}
                      {log.action === "reimbursed" && "Marked as Reimbursed"}
                    </div>
                    <div className="text-xs md:text-sm text-zinc-500 mt-0.5">
                      by{" "}
                      <span className="text-[#121110] font-medium">
                        {log.actorName || "Unknown User"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-[2rem] p-6 border border-zinc-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Meta Data</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ID</span>
                  <span className="font-mono font-bold">
                    #{expense.id.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Merchant</span>
                  <span className="font-bold">Multiple</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-200 p-4 md:hidden flex gap-3 z-50">
        {/* Edit button - only for expense owner before approval */}
        {!expense.deletedAt && session?.user?.id === expense.userId && (
          <Button
            asChild
            variant="ghost"
            className="flex-1 bg-zinc-100 text-zinc-600 font-bold py-3.5 rounded-xl text-sm active:bg-zinc-200 transition-colors"
          >
            <Link href={`/dashboard/expenses/${expense.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        )}

        {/* Status dropdown - only for admins */}
        {isAdmin && (
          <div className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-between font-medium ${getStatusColor(expense.state)} ${approveExpense.isPending || rejectExpense.isPending || reimburseExpense.isPending ? "opacity-50" : ""}`}
                  disabled={
                    approveExpense.isPending ||
                    rejectExpense.isPending ||
                    reimburseExpense.isPending
                  }
                >
                  <span className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        expense.state === EXPENSE_STATES.APPROVED
                          ? "bg-green-500"
                          : expense.state === EXPENSE_STATES.REJECTED
                            ? "bg-red-500"
                            : expense.state === EXPENSE_STATES.REIMBURSED
                              ? "bg-indigo-500"
                              : "bg-current opacity-60"
                      }`}
                    />
                    {getStatusLabel(expense.state)}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium text-gray-500 border-b">
                  Change Status
                </div>
                {Object.values(EXPENSE_STATES)
                  .filter((status) => status !== expense.state)
                  .map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            status === EXPENSE_STATES.APPROVED
                              ? "bg-green-500"
                              : status === EXPENSE_STATES.REJECTED
                                ? "bg-red-500"
                                : status === EXPENSE_STATES.REIMBURSED
                                  ? "bg-indigo-500"
                                  : "bg-gray-400"
                          }`}
                        />
                        {getStatusLabel(status)}
                      </span>
                      {status === expense.state && (
                        <Check className="w-4 h-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
