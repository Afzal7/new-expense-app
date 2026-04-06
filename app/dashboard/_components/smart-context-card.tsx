"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  Clock,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrganizationRole } from "@/hooks/use-active-member";
import type { SmartContextFlat } from "@/lib/validations/dashboard-summary";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

function BurnBars({ percents }: { percents: number[] }) {
  return (
    <div
      className="mt-2 flex h-12 w-full items-end gap-1.5 opacity-80"
      role="img"
      aria-label="Burn trend over the last seven days"
    >
      {percents.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${i === percents.length - 1 ? "bg-[#121110]" : "bg-zinc-200"}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function FreeUpsellCard() {
  return (
    <Link
      href="/dashboard/upgrade"
      className="group relative block h-full min-h-36 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#121110] to-[#2C2C2C] p-6 shadow-lg outline-none ring-offset-2 ring-offset-[#FDF8F5] focus-visible:ring-2 focus-visible:ring-[#D0FC42]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(https://grainy-gradients.vercel.app/noise.svg)",
        }}
      />
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-purple-500 opacity-30 blur-[60px]" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500 opacity-30 blur-[60px]" />
      <div className="relative z-10 flex min-h-36 flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="rounded border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            PRO
          </div>
          <Sparkles className="h-5 w-5 text-[#D0FC42]" aria-hidden />
        </div>
        <div className="mt-auto mb-2 space-y-2">
          <div className="flex items-center gap-2 text-white">
            <Zap
              className="h-3 w-3 fill-[#D0FC42] text-[#D0FC42]"
              aria-hidden
            />
            <span className="text-xs font-bold">AI Receipt Autofill</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Briefcase className="h-3 w-3 text-[#D0FC42]" aria-hidden />
            <span className="text-xs font-bold">Create Organizations</span>
          </div>
        </div>
        <span className="mt-1 inline-flex items-center gap-2 text-xs font-bold text-[#D0FC42]">
          Upgrade Now
          <ChevronRight className="h-3 w-3" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function SmartContextCard({
  ctx,
  role,
  isPaidTier,
  subscriptionLoading,
  memberLoading,
  createOrganizationSlot,
}: {
  ctx: SmartContextFlat;
  role: OrganizationRole | null;
  isPaidTier: boolean;
  /** When true and user has no org, we wait before choosing free vs pro solo */
  subscriptionLoading: boolean;
  memberLoading: boolean;
  createOrganizationSlot?: ReactNode;
}) {
  if (ctx.sessionOrgError) {
    return (
      <Alert
        variant="default"
        className="h-full rounded-[2rem] border-zinc-200"
      >
        <AlertTitle>Organization</AlertTitle>
        <AlertDescription>{ctx.sessionOrgError}</AlertDescription>
      </Alert>
    );
  }

  if (memberLoading) {
    return <Skeleton className="h-48 min-h-36 rounded-[2rem]" />;
  }

  if (!role) {
    if (subscriptionLoading) {
      return <Skeleton className="h-48 min-h-36 rounded-[2rem]" />;
    }
    if (isPaidTier && ctx.receiptsWithAttachmentsThisMonth != null) {
      return (
        <div className="relative h-full overflow-hidden rounded-[2rem] border border-[#FFD0B0] bg-[#FFF0E6] p-6">
          <div className="relative z-10 flex min-h-36 flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E66A45]">
                <Zap className="h-3 w-3 fill-current" aria-hidden />
                Pro Active
              </div>
            </div>
            <div>
              <div className="font-mono text-3xl font-bold tracking-tighter text-[#121110]">
                {ctx.receiptsWithAttachmentsThisMonth}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Receipts with attachments this month
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#FFD0B0]/50 pt-3">
              <span className="text-[10px] font-bold tracking-wide text-[#121110] uppercase">
                Create team
              </span>
              {createOrganizationSlot ?? (
                <span className="text-xs text-zinc-500">—</span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return <FreeUpsellCard />;
  }

  if (role === "owner") {
    if (
      ctx.ownerMonthBurnCents == null ||
      ctx.burnByDayPercent == null ||
      ctx.organizationId == null
    ) {
      return (
        <Alert variant="default" className="rounded-[2rem]">
          <AlertTitle>Dashboard</AlertTitle>
          <AlertDescription>
            Organization metrics could not be loaded. Refresh or try again
            later.
          </AlertDescription>
        </Alert>
      );
    }
    const pending = ctx.pendingApprovalCount ?? 0;
    const orgId = ctx.organizationId;
    return (
      <div className="relative h-full overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm transition-colors hover:border-zinc-300">
        <div className="relative z-10 flex min-h-36 flex-col justify-between">
          <div className="flex items-start justify-between">
            <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Company Burn
            </h3>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <div className="font-mono text-3xl font-bold tracking-tighter text-[#121110]">
                {formatUsd(ctx.ownerMonthBurnCents)}
              </div>
              <div className="text-xs font-bold text-zinc-400">This month</div>
            </div>
            <BurnBars percents={ctx.burnByDayPercent} />
          </div>
          {pending > 0 ? (
            <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <p className="text-[10px] font-bold text-zinc-600 uppercase">
                Awaiting your review
              </p>
              <Button asChild size="sm" className="mt-2 h-8 w-full text-xs">
                <Link href="/dashboard/manager/approvals">
                  Review {pending} request{pending === 1 ? "" : "s"}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ) : null}
          {(ctx.financeQueueCount ?? 0) > 0 ? (
            <div className="mt-2 text-xs">
              <Link
                href="/dashboard/finance/reimbursements"
                className="font-medium text-[#E66A45] underline-offset-2 hover:underline"
              >
                {ctx.financeQueueCount} approved — process reimbursement
              </Link>
            </div>
          ) : null}
          <Button
            asChild
            variant="outline"
            className="mt-3 rounded-2xl border-[#FFD0B0] bg-[#FFF0E6] text-[#E66A45] hover:bg-[#FFE8D9]"
          >
            <Link href={`/dashboard/organizations/${orgId}/invitations`}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite team members
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (role === "admin") {
    const n = ctx.pendingApprovalCount ?? 0;
    return (
      <div className="relative h-full overflow-hidden rounded-[2rem] bg-[#121110] p-6 text-white shadow-sm">
        <div className="relative z-10 flex min-h-36 flex-col justify-between">
          <div className="flex items-start justify-between">
            <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Team Inbox
            </h3>
            {n > 0 ? (
              <div className="animate-pulse rounded-full bg-[#D0FC42] px-2 py-0.5 text-[10px] font-bold text-[#121110]">
                Action needed
              </div>
            ) : null}
          </div>
          <div>
            <div className="font-mono text-4xl font-bold tracking-tighter">
              {n}
            </div>
            <div className="mt-1 text-xs text-zinc-400">
              {n === 0 ? "All caught up" : "Requests waiting"}
            </div>
          </div>
          <Button
            asChild
            className="w-full rounded-xl border-0 bg-white/10 text-xs font-bold text-white hover:bg-white/20"
          >
            <Link href="/dashboard/manager/approvals">
              Review now
              <ChevronRight className="ml-1 h-3 w-3" aria-hidden />
            </Link>
          </Button>
          {(ctx.financeQueueCount ?? 0) > 0 ? (
            <Link
              href="/dashboard/finance/reimbursements"
              className="mt-2 text-center text-[10px] font-medium text-[#D0FC42] underline-offset-2 hover:underline"
            >
              {ctx.financeQueueCount} ready for reimbursement
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const chip =
    ctx.memberStatusSummary === "pending_review"
      ? {
          text: "Pending review",
          className: "border-orange-200 bg-orange-100 text-orange-700",
        }
      : ctx.memberStatusSummary === "approved_awaiting_pay"
        ? {
            text: "Approved — awaiting pay",
            className: "border-[#B8E630] bg-[#D0FC42] text-[#121110]",
          }
        : null;

  const owed = ctx.memberOwedCents ?? 0;

  return (
    <div className="h-full rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="relative z-10 flex min-h-36 flex-col justify-between">
        <div className="flex items-start justify-between">
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            Owed to me
          </h3>
          <Briefcase className="h-5 w-5 text-zinc-300" aria-hidden />
        </div>
        <div>
          <div className="font-mono text-3xl font-bold tracking-tighter text-[#121110]">
            {formatUsd(owed)}
          </div>
          {owed === 0 && !chip ? (
            <p className="mt-2 text-xs text-zinc-500">
              No outstanding reimbursements
            </p>
          ) : null}
          {chip ? (
            <div
              className={`mt-3 inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-[10px] font-bold ${chip.className}`}
            >
              <Clock className="h-3 w-3" aria-hidden />
              {chip.text}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
