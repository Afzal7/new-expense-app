"use client";

import { PieChart } from "lucide-react";
import type { DashboardSummaryResponse } from "@/lib/validations/dashboard-summary";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function InlineAnalyticsCard({
  data,
}: {
  data: DashboardSummaryResponse["analytics"];
}) {
  const maxCents = Math.max(...data.days.map((d) => d.amountCents), 1);

  const hasActivity = data.days.some((d) => d.amountCents > 0);
  const hasCategories = data.topCategories.length > 0;

  return (
    <div className="space-y-6 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-zinc-400 uppercase">
          <PieChart className="h-4 w-4" aria-hidden />
          Analytics
        </h3>
        <div className="rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-bold text-[#121110]">
          Last 7 Days
        </div>
      </div>

      {!hasActivity ? (
        <p className="text-sm text-zinc-500">No activity in this window.</p>
      ) : (
        <div className="flex h-24 items-end justify-between gap-2">
          {data.days.map((item, i) => {
            const hPct = Math.round((item.amountCents / maxCents) * 100);
            return (
              <div
                key={`${item.label}-${i}`}
                className="group flex flex-1 cursor-pointer flex-col items-center gap-2"
              >
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className={`w-full max-w-[12px] origin-bottom rounded-full transition-all duration-300 group-hover:scale-y-110 ${
                      item.isToday
                        ? "bg-[#FF8A65]"
                        : "bg-zinc-100 group-hover:bg-zinc-200"
                    }`}
                    style={{ height: `${Math.max(hPct, 4)}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold ${
                    item.isToday ? "text-[#FF8A65]" : "text-zinc-300"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="h-px w-full bg-zinc-100" />

      <div className="space-y-3">
        <h4 className="mb-3 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          Top Categories
        </h4>
        {!hasCategories ? (
          <p className="text-sm text-zinc-500">No categories yet.</p>
        ) : (
          data.topCategories.map((cat) => (
            <div key={cat.name} className="group cursor-pointer">
              <div className="mb-1 flex justify-between text-xs font-bold text-[#121110]">
                <span>{cat.name}</span>
                <span>{formatUsd(cat.amountCents)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-[#121110]"
                  style={{ width: `${cat.percentOfTotal}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
