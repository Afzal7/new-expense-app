const IconFolderOpen = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
  </svg>
);

interface ExpenseEmptyStateProps {
  tab: string;
  onRefresh?: () => void;
}

export const ExpenseEmptyState = ({
  tab,
  onRefresh,
}: ExpenseEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6 text-zinc-400">
      <IconFolderOpen className="w-10 h-10" />
    </div>
    <h3 className="text-xl font-bold mb-2">No expenses found</h3>
    <p className="text-zinc-500 max-w-xs mb-8">
      Your {tab === "work" ? "Company Workspace" : "Personal Vault"} is empty.
      {tab === "work"
        ? " Time to get back to work!"
        : " Start tracking your personal spend."}
    </p>
    <button
      onClick={onRefresh}
      className="bg-white border border-zinc-200 text-[#121110] px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-50 transition-colors shadow-sm"
    >
      Refresh List
    </button>
  </div>
);
