import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder matching {@link ExpenseListCard}: icon, title + subtitle, amount + badge.
 */
export function ExpenseListCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-[1.25rem] border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Skeleton className="size-12 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 max-w-[14rem] rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 pl-2">
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

interface ExpenseListSkeletonProps {
  /** Number of placeholder rows (default matches a short first paint). */
  count?: number;
}

export function ExpenseListSkeleton({ count = 5 }: ExpenseListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ExpenseListCardSkeleton
          key={
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            `expense-list-skeleton-${i}`
          }
        />
      ))}
    </div>
  );
}
