import { Skeleton } from "@/components/ui/skeleton";

function LineItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-4/5 max-w-xs rounded-md" />
          <Skeleton className="h-3 w-48 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-14 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 rounded-md" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExpenseFormPageSkeletonProps {
  /** Create flow empty state vs edit flow with line items. */
  variant: "ctas" | "editor";
}

/**
 * Mirrors {@link ExpenseForm} header and main column while org / expense data loads.
 */
export function ExpenseFormPageSkeleton({ variant }: ExpenseFormPageSkeletonProps) {
  return (
    <div
      className="min-h-screen bg-background pb-[calc(14rem+env(safe-area-inset-bottom))] font-sans text-foreground"
      aria-busy="true"
      aria-label="Loading expense form"
    >
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 py-4 backdrop-blur-xl">
        <Skeleton className="-ml-2 size-10 shrink-0 rounded-full" />
        <Skeleton className="h-5 w-28 rounded-md" />
        <div className="w-10 shrink-0" />
      </div>

      <div className="mx-auto w-full max-w-xl pt-3">
        {variant === "ctas" ? (
          <div className="space-y-6 py-12">
            <Skeleton className="h-52 w-full rounded-[2.5rem]" />
            <Skeleton className="h-52 w-full rounded-[2.5rem]" />
          </div>
        ) : (
          <div className="space-y-6">
            <LineItemCardSkeleton />
            <LineItemCardSkeleton />
            <div className="mt-10 space-y-3">
              <Skeleton className="ml-1 h-4 w-24 rounded-md" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="h-24" />
          </div>
        )}
      </div>

      {variant === "editor" ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <div className="mx-auto w-full max-w-xl">
            <div className="flex gap-2 border-b border-border/80 px-4 pb-3 pt-3 sm:px-6 sm:pb-4">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 flex-1 rounded-xl" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
            <div className="flex gap-2 px-4 pb-5 pt-3 sm:px-6">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
