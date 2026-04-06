"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function DashboardFab() {
  return (
    <Link
      href="/dashboard/expenses/create"
      className="fixed right-4 bottom-6 z-40 flex h-16 w-16 shrink-0 items-center justify-center rounded-[2rem] bg-[#121110] text-white shadow-2xl shadow-[#121110]/30 transition-transform hover:-translate-y-1 active:scale-90 md:right-6 md:bottom-8 md:h-auto md:w-auto md:min-h-14 md:gap-2 md:rounded-full md:px-5 md:py-3.5"
      aria-label="Create new expense"
    >
      <Plus className="h-8 w-8 shrink-0 md:h-5 md:w-5" aria-hidden />
      <span className="hidden text-sm font-bold whitespace-nowrap md:inline md:pr-0.5">
        New expense
      </span>
    </Link>
  );
}
