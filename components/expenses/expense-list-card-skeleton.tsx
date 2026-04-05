export const ExpenseListCardSkeleton = () => (
  <div className="bg-white p-4 rounded-[1.25rem] border border-zinc-200 shadow-sm flex items-center justify-between relative overflow-hidden">
    {/* Shimmer overlay */}
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />

    <div className="flex items-center gap-4">
      {/* Category Icon Skeleton */}
      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex-shrink-0" />

      {/* Content Skeleton */}
      <div className="min-w-0">
        <div className="h-4 bg-zinc-100 rounded w-32 mb-2" />
        <div className="h-3 bg-zinc-50 rounded w-20" />
      </div>
    </div>

    {/* Amount Skeleton */}
    <div className="text-right flex-shrink-0">
      <div className="h-5 bg-zinc-100 rounded w-16 mb-2" />
      <div className="h-5 bg-zinc-100 rounded-full w-20" />
    </div>
  </div>
);
