"use client";

import Link from "next/link";
import type { Expense } from "@/types/expense";
import { SimpleStatusBadge } from "@/components/expenses/simple-status-badge";
import { CategoryIcon } from "@/components/shared/category-icon";
import { getExpenseMerchant, getExpenseCategory, isPrivateExpense } from "@/lib/utils/expense-display";

interface ExpenseListCardProps {
  expense: Expense;
  showEmployeeName?: boolean;
  employeeName?: string;
  routePrefix?: string;
}

/**
 * ExpenseCard component matching the template design
 * Used in the expense list page with different states and contexts
 */
export function ExpenseListCard({
  expense,
  showEmployeeName = false,
  employeeName,
  routePrefix = "/dashboard/expenses",
}: ExpenseListCardProps) {
  const merchant = getExpenseMerchant(expense);
  const category = getExpenseCategory(expense);
  const isPrivate = isPrivateExpense(expense);

  return (
    <Link href={`${routePrefix}/${expense.id}`} className="block">
      <div className="group bg-white p-4 rounded-[1.25rem] border border-zinc-200 shadow-sm flex items-center justify-between active:scale-[0.99] transition-all hover:border-zinc-300">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-zinc-100 shrink-0 text-zinc-600 ${
              isPrivate ? "bg-[#FFF0E0]" : "bg-zinc-50"
            }`}
          >
            <CategoryIcon category={category} size={22} />
          </div>
          <div className="min-w-0">
            {showEmployeeName ? (
              <div>
                <div className="font-bold text-[#121110] text-sm">
                  {employeeName || "Unknown User"}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">{merchant}</div>
              </div>
            ) : (
              <div>
                <div className="font-bold text-[#121110] text-base truncate">
                  {merchant}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">{category}</div>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-lg text-[#121110]">
            ${expense.totalAmount.toFixed(2)}
          </div>
          <div className="flex justify-end mt-1">
            <SimpleStatusBadge state={expense.state} />
          </div>
        </div>
      </div>
    </Link>
  );
}
