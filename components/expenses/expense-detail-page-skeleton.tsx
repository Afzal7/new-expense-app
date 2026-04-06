import { Skeleton } from "@/components/ui/skeleton";

function LineItemRowSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row">
      <Skeleton className="h-32 w-full shrink-0 rounded-xl md:h-16 md:w-16" />
      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="flex justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 max-w-[12rem] rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading layout aligned with the expense detail page (hero total, line items, history block).
 */
export function ExpenseDetailPageSkeleton() {
  return (
    <div
      className="min-h-screen bg-background font-sans text-foreground"
      aria-busy="true"
      aria-label="Loading expense"
    >
      <div className="mx-auto w-full max-w-2xl space-y-6 pt-3">
        {/* Back + context + status */}
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-36 max-w-[50%] rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 shrink-0 rounded-full" />
        </div>

        {/* Hero total */}
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-4 w-28 rounded-md" />
          <Skeleton className="mx-auto h-14 w-48 max-w-[85%] rounded-lg md:h-16 md:w-56" />
        </div>

        {/* Receipts & items */}
        <div className="space-y-4">
          <Skeleton className="ml-1 h-4 w-40 rounded-md" />
          <div className="space-y-3">
            <LineItemRowSkeleton />
            <LineItemRowSkeleton />
          </div>
        </div>

        {/* History section (org expenses) — optional block users often see */}
        <div className="space-y-4 border-t border-border pt-6">
          <Skeleton className="ml-1 h-4 w-24 rounded-md" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
