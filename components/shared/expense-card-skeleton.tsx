export const ExpenseCardSkeleton = () => (
  <div className="bg-white p-4 md:p-5 rounded-[1.5rem] border border-zinc-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
    {/* Shimmer overlay */}
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />

    {/* Date Block Skeleton */}
    <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-zinc-100 rounded-2xl">
      <div className="h-3 bg-zinc-200 rounded w-6 mb-1" />
      <div className="h-4 bg-zinc-200 rounded w-4" />
    </div>

    {/* Content Skeleton */}
    <div className="flex-1 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
        <div className="h-5 bg-zinc-100 rounded w-48 md:w-64" />
        <div className="hidden md:block h-6 bg-zinc-100 rounded-full w-16" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 bg-zinc-50 rounded w-12" />
        <div className="h-3 bg-zinc-50 rounded w-20" />
        <div className="md:hidden h-5 bg-zinc-100 rounded-full w-14" />
      </div>
    </div>

    {/* Amount Skeleton */}
    <div className="text-right flex-shrink-0">
      <div className="h-6 bg-zinc-100 rounded w-20 mb-1" />
      <div className="hidden md:flex h-3 bg-zinc-50 rounded w-12" />
    </div>
  </div>
);
