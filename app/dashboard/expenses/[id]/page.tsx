"use client";

import React from "react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

import { ExpenseStatusDropdown } from "@/components/expenses/ExpenseStatusDropdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Receipt, Edit, MoreHorizontal } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { useExpense } from "@/hooks/use-expenses";
import { useSession } from "@/lib/auth-client";
import { useIsManager } from "@/hooks/use-is-manager";
import { toast } from "@/lib/toast";
import { ExpenseBusinessRules } from "@/lib/utils/expense-business-logic";
import { getCategoryEmoji } from "@/lib/constants/categories";
import { getAuditActionLabel } from "@/lib/utils/audit-labels";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import type { LineItem } from "@/types/expense";
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

  // Comment state for approve/reject actions
  const [comment, setComment] = React.useState("");

  const handleStatusChange = async (
    newStatus: string,
    commentInput?: string
  ) => {
    if (!expense) return;

    // Prevent users from approving their own expenses (FR-011, FR-036)
    const isExpenseOwner = session?.user?.id === expense.userId;
    const isApprovalAction =
      newStatus === EXPENSE_STATES.APPROVED ||
      newStatus === EXPENSE_STATES.PRE_APPROVED;

    if (isApprovalAction && isExpenseOwner) {
      toast.error("You cannot approve your own expense");
      return;
    }

    // Log comment for audit trail (API integration pending)
    if (commentInput && commentInput.trim()) {
      console.log(`Comment for ${newStatus}:`, commentInput.trim());
    }

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
        toast.error(
          `Cannot change to ${newStatus}. This transition is not supported.`
        );
    }

    // Clear comment after submission
    setComment("");
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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-6 max-w-md lg:max-w-2xl xl:max-w-4xl">
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

  // Export functions
  const exportAsCSV = () => {
    if (!expense) return;

    const headers = ["Date", "Description", "Category", "Amount"];
    const rows = expense.lineItems.map((item) => [
      new Date(item.date).toLocaleDateString(),
      item.description || "",
      item.category || "",
      item.amount.toFixed(2),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expense-${expense.id.slice(-8)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsPDF = () => {
    if (!expense) return;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(`Expense #${expense.id.slice(-8)}`, 14, 22);

    // Add metadata
    doc.setFontSize(12);
    doc.text(`Status: ${expense.state}`, 14, 32);
    doc.text(`Total Amount: $${expense.totalAmount.toFixed(2)}`, 14, 40);
    doc.text(
      `Created: ${new Date(expense.createdAt).toLocaleDateString()}`,
      14,
      48
    );

    // Add line items table
    const tableData = expense.lineItems.map((item) => [
      new Date(item.date).toLocaleDateString(),
      item.description || "",
      item.category || "",
      `$${item.amount.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 58,
      head: [["Date", "Description", "Category", "Amount"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [17, 17, 16] },
    });

    doc.save(`expense-${expense.id.slice(-8)}.pdf`);
  };

  // Calculate line items total for comparison with pre-approved amount
  const lineItemsTotal =
    expense?.lineItems?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const exceedsPreApproved =
    expense &&
    (expense.state === EXPENSE_STATES.PRE_APPROVED ||
      expense.state === EXPENSE_STATES.APPROVED) &&
    lineItemsTotal > expense.totalAmount;

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
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  {/* Status badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="inline-block px-3 py-1 bg-[#F0FDF4] text-emerald-600 border border-emerald-100 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      {expense.state === "Approved"
                        ? "Approved"
                        : expense.state.replace("-", " ")}
                    </div>
                    {/* Private badge for personal expenses */}
                    {!expense.organizationId && (
                      <div className="inline-block px-2 py-1 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full text-[10px] md:text-xs font-medium">
                        Private
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-[#121110]">
                    {ExpenseBusinessRules.generateExpenseTitle(expense)}
                  </h1>

                  {/* Warning when line items exceed pre-approved amount */}
                  {exceedsPreApproved && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-medium">
                      <span>⚠️</span>
                      <span>
                        Total (${lineItemsTotal.toFixed(2)}) exceeds
                        pre-approved amount (${expense.totalAmount.toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Amount */}
                <div className="text-right">
                  <div className="text-zinc-400 text-xs md:text-sm font-medium mb-1">
                    Total Amount
                  </div>
                  <div className="font-mono text-3xl md:text-4xl font-bold tracking-tighter text-[#121110]">
                    ${expense.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Desktop Action Bar */}
              <div className="hidden md:flex gap-3 border-t border-zinc-100 pt-6 mt-6">
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

                {/* Export dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold py-3 rounded-xl text-sm transition-colors border border-zinc-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 rotate-[-90deg]" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={exportAsCSV}
                      className="cursor-pointer"
                    >
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={exportAsPDF}
                      className="cursor-pointer"
                    >
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Status dropdown - only for admins */}
                {isAdmin && (
                  <ExpenseStatusDropdown
                    expense={expense}
                    isAdmin={isAdmin}
                    isPending={
                      approveExpense.isPending ||
                      rejectExpense.isPending ||
                      reimburseExpense.isPending
                    }
                    onStatusChange={handleStatusChange}
                    comment={comment}
                    onCommentChange={setComment}
                  />
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
                          {getCategoryEmoji(item.category)}
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
                            <div className="font-mono font-bold text-lg md:hidden">
                              ${item.amount.toFixed(2)}
                            </div>
                          </div>

                          {/* Attachments Area */}
                          {item.attachments && item.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.attachments.map(
                                (url: string, idx: number) => {
                                  const isImage = url.match(
                                    /\.(jpg|jpeg|png|gif|webp)$/i
                                  );
                                  const isPdf = url.match(/\.pdf$/i);

                                  return (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group relative w-12 h-12 bg-zinc-100 hover:bg-zinc-200 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all duration-200 flex items-center justify-center overflow-hidden"
                                      title={
                                        isPdf
                                          ? "View PDF"
                                          : "Click to view attachment"
                                      }
                                    >
                                      {isImage ? (
                                        <img
                                          src={url}
                                          alt={`Attachment ${idx + 1}`}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                        />
                                      ) : isPdf ? (
                                        <span className="text-xs font-bold text-red-600">
                                          PDF
                                        </span>
                                      ) : (
                                        <span className="text-xs font-bold text-zinc-500">
                                          FILE
                                        </span>
                                      )}
                                    </a>
                                  );
                                }
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
                      {getAuditActionLabel(log.action)}
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
                <div className="flex justify-between items-start">
                  <span className="text-zinc-500">Type</span>
                  <div className="text-right">
                    {expense.organizationId ? (
                      <span className="font-bold">Organization</span>
                    ) : (
                      <span className="text-zinc-400 italic">Personal</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-zinc-500">Assigned Managers</span>
                  <div className="text-right">
                    {expense.managerIds && expense.managerIds.length > 0 ? (
                      <div className="font-bold">
                        {expense.managerIds.length} manager
                        {expense.managerIds.length > 1 ? "s" : ""}
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic">No managers</span>
                    )}
                  </div>
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

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 bg-zinc-100 text-zinc-600 font-bold py-3.5 rounded-xl text-sm active:bg-zinc-200 transition-colors border border-zinc-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2 rotate-[-90deg]" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={exportAsCSV} className="cursor-pointer">
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportAsPDF} className="cursor-pointer">
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status dropdown - only for admins */}
        {isAdmin && (
          <div className="flex-1">
            <ExpenseStatusDropdown
              expense={expense}
              isAdmin={isAdmin}
              isPending={
                approveExpense.isPending ||
                rejectExpense.isPending ||
                reimburseExpense.isPending
              }
              onStatusChange={handleStatusChange}
              comment={comment}
              onCommentChange={setComment}
            />
          </div>
        )}
      </div>
    </div>
  );
}
