import type { Expense } from "@/types/expense";
import Link from "next/link";
import { ExpenseStatusBadge } from "./expense-status-badge";
import { CategoryIcon } from "./category-icon";

const IconChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

interface ExpenseCardProps {
  expense: Expense;
  routePrefix?: string;
}

export const ExpenseCard = ({
  expense,
  routePrefix = "/dashboard/expenses",
}: ExpenseCardProps) => {
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

  return (
    <Link
      key={expense.id}
      href={`${routePrefix}/${expense.id}`}
      className="block"
    >
      <div className="group bg-white p-4 md:p-5 rounded-[1.5rem] border border-zinc-100 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 md:gap-6">
        {/* Date Block */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#FDF8F5] rounded-2xl border border-zinc-100 text-zinc-500 group-hover:bg-[#FFF0E0] group-hover:text-[#FF8A65] transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {new Date(expense.createdAt).toLocaleDateString("en-US", {
              month: "short",
            })}
          </span>
          <span className="text-lg md:text-xl font-bold">
            {new Date(expense.createdAt).getDate()}
          </span>
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
            <h3 className="font-bold text-base md:text-lg truncate text-[#121110]">
              {getExpenseTitle(expense)}
            </h3>
            <div className="hidden md:block">
              <ExpenseStatusBadge state={expense.state.toLowerCase()} />
            </div>
          </div>
          <div className="text-xs md:text-sm text-zinc-500 truncate flex items-center gap-2">
            <CategoryIcon category={expense.lineItems[0]?.category} size={14} className="text-muted-foreground" />
            <span>{expense.lineItems[0]?.category || "Expense"}</span>
            <span className="md:hidden">•</span>
            <div className="md:hidden">
              <ExpenseStatusBadge state={expense.state.toLowerCase()} />
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <div className="font-mono font-bold text-lg md:text-xl text-[#121110]">
            ${expense.totalAmount.toFixed(2)}
          </div>
          <div className="hidden md:flex text-xs text-zinc-400 font-bold group-hover:text-[#FF8A65] items-center justify-end gap-1 mt-1">
            View <IconChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
};
