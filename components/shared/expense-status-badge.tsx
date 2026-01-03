import type { Expense } from "@/types/expense";

interface ExpenseStatusBadgeProps {
  state: string;
}

export const ExpenseStatusBadge = ({ state }: ExpenseStatusBadgeProps) => {
  const styles: Record<string, string> = {
    draft: "bg-zinc-100 text-zinc-500 border-zinc-200",
    submitted: "bg-[#FFF0E0] text-[#FF8A65] border-[#FFD0B0]",
    approved: "bg-[#F0FDF4] text-emerald-600 border-emerald-200",
    rejected: "bg-red-50 text-red-500 border-red-100",
    reimbursed: "bg-[#D0FC42]/20 text-[#121110] border-[#D0FC42]",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold border uppercase tracking-wider ${styles[state] || styles.draft}`}
    >
      {state}
    </span>
  );
};
