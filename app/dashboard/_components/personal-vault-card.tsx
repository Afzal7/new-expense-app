"use client";

import { Lock } from "lucide-react";
import type { DashboardSummaryResponse } from "@/lib/validations/dashboard-summary";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function Sparkline({ series }: { series: number[] }) {
  if (series.length === 0) {
    return null;
  }
  const w = 100;
  const h = 40;
  const max = Math.max(...series, 1);
  const step = w / (series.length - 1 || 1);
  const points = series
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h * 0.65) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="h-10 w-24 overflow-visible text-[#FF8A65]"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-50"
      />
    </svg>
  );
}

export function PersonalVaultCard({
  data,
}: {
  data: DashboardSummaryResponse["personalVault"];
}) {
  const trend = data.trendPercent;
  const trendLabel =
    trend === null ? null : trend >= 0 ? `+${trend}%` : `${trend}%`;

  return (
    <div className="relative h-full overflow-hidden rounded-[2rem] bg-[#121110] p-6 text-white shadow-xl shadow-zinc-300">
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: "url(https://grainy-gradients.vercel.app/noise.svg)",
        }}
      />
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#FF8A65] opacity-20 blur-[60px]" />
      <div className="relative z-10 flex min-h-36 flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              <Lock className="h-3 w-3" aria-hidden />
              Personal Vault
            </h3>
            <div className="mt-1 font-mono text-3xl font-bold tracking-tighter">
              {formatUsd(data.totalCents)}
            </div>
          </div>
          <div className="inline-flex items-center justify-center rounded-lg border border-white/5 bg-white/10 px-2 py-1 leading-none backdrop-blur-md">
            <span className="text-[10px] font-bold leading-none text-[#FF8A65]">
              {data.monthLabel}
            </span>
          </div>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-400">
            {trendLabel !== null ? (
              <>
                <span className="rounded bg-[#D0FC42] px-1.5 py-0.5 font-bold text-[#121110]">
                  {trendLabel}
                </span>
                <span>vs prior year</span>
              </>
            ) : data.totalCents > 0 ? (
              <span>New vs prior year</span>
            ) : (
              <span>No spend in past year</span>
            )}
          </div>
          <Sparkline series={data.sparklineSeries} />
        </div>
      </div>
    </div>
  );
}
