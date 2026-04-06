"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function ReceiptPreviewDecor() {
  return (
    <div
      className="relative hidden w-full max-w-[220px] shrink-0 sm:block lg:max-w-[260px]"
      aria-hidden
    >
      <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="h-2 w-16 rounded-full bg-zinc-200" />
          <div className="h-2 w-8 rounded-full bg-[#FF8A65]/40" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-zinc-100" />
            <div className="h-2 w-12 rounded-full bg-zinc-200" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-zinc-100" />
            <div className="h-2 w-10 rounded-full bg-zinc-200" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-[58%] rounded-full bg-zinc-100" />
            <div className="h-2 w-14 shrink-0 rounded-full bg-[#D0FC42]/80" />
          </div>
        </div>
        <div className="mt-5 flex justify-end border-t border-zinc-100 pt-4">
          <div className="h-3 w-20 rounded-md bg-zinc-800/10" />
        </div>
      </div>
      <div className="absolute -top-3 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#FFD0B0]/60 bg-[#FFF0E6] text-[#E66A45] shadow-md">
        <Sparkles className="h-4 w-4" />
      </div>
    </div>
  );
}

export function FirstExpenseCtaCard({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard/expenses/create"
      className={cn(
        "group relative isolate block overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-gradient-to-br from-white via-[#FFFCFA] to-[#FFF3EB] p-6 shadow-[0_1px_0_rgba(0,0,0,0.03),0_12px_40px_-12px_rgba(230,106,69,0.12)] outline-none ring-offset-2 ring-offset-background transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[#FFD0B0] hover:shadow-[0_1px_0_rgba(0,0,0,0.04),0_20px_50px_-16px_rgba(230,106,69,0.18)] focus-visible:ring-2 focus-visible:ring-[#E66A45]/40 md:p-8",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-overlay"
        style={{
          backgroundImage: "url(https://grainy-gradients.vercel.app/noise.svg)",
        }}
      />
      <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-[#FF8A65]/20 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-44 w-44 rounded-full bg-[#D0FC42]/15 blur-[70px]" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[#B8E630]/60 bg-[#D0FC42] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#121110] uppercase">
              Start here
            </span>
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              First expense
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-pretty text-2xl font-bold tracking-tight text-[#121110] md:text-[1.65rem] md:leading-tight">
              Add your first expense in seconds
            </h2>
            <p className="max-w-xl text-pretty text-sm leading-relaxed text-zinc-600 md:text-[15px]">
              Capture receipts, split line items, and assign categories so your
              vault and analytics start filling in automatically.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#121110] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/15 transition-[transform,background-color] duration-300 group-hover:bg-[#E66A45] group-hover:shadow-[#E66A45]/25">
              Create expense
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
            <span className="text-xs font-medium text-zinc-400">
              Private drafts supported — submit when you&apos;re ready
            </span>
          </div>
        </div>

        <ReceiptPreviewDecor />
      </div>
    </Link>
  );
}
