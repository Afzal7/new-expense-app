"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SubscriptionBanner } from "@/components/shared/subscription-banner";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { useActiveMember } from "@/hooks/use-active-member";
import { useSubscription } from "@/hooks/use-subscription";
import { PersonalVaultCard } from "./personal-vault-card";
import { SmartContextCard } from "./smart-context-card";
import { InlineAnalyticsCard } from "./inline-analytics-card";
import { DashboardFab } from "./dashboard-fab";
import { CreateOrganizationModal } from "./create-organization-modal";
import { FirstExpenseCtaCard } from "./first-expense-cta-card";

export function DashboardContent() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const summary = useDashboardSummary();
  const { data: activeMember, isPending: memberLoading } = useActiveMember();
  const { data: subscriptionData, isPending: subscriptionLoading } =
    useSubscription();

  const role = activeMember?.role ?? null;
  const isPaidTier = Boolean(subscriptionData?.subscription);

  const invalidateDashboard = () => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    void queryClient.invalidateQueries({ queryKey: ["active-member"] });
  };

  const noActiveOrg = !memberLoading && activeMember === null;
  const waitSubscriptionForSoloCard = noActiveOrg && subscriptionLoading;

  return (
    <div className="relative pb-28">
      <SubscriptionBanner />

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#121110]">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Hi
            {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
            {" — "}
            here&apos;s your spending breakdown
          </p>
        </div>

        {summary.isPending ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-48 rounded-[2rem]" />
              <Skeleton className="h-48 rounded-[2rem]" />
            </div>
            <Skeleton className="h-64 w-full rounded-[2rem]" />
          </div>
        ) : summary.isError ? (
          <div className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              {summary.error instanceof Error
                ? summary.error.message
                : "Could not load dashboard."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void summary.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : summary.data ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {!summary.data.hasCreatedExpense ? (
                <FirstExpenseCtaCard className="sm:col-span-2" />
              ) : null}
              <PersonalVaultCard data={summary.data.personalVault} />
              <SmartContextCard
                ctx={summary.data.smartContext}
                role={role}
                isPaidTier={isPaidTier}
                subscriptionLoading={waitSubscriptionForSoloCard}
                memberLoading={memberLoading}
                createOrganizationSlot={
                  <CreateOrganizationModal
                    trigger={
                      <Button
                        type="button"
                        size="icon"
                        className="h-9 w-9 rounded-full bg-white text-[#E66A45] shadow-sm"
                        aria-label="Create organization"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    }
                    onOrganizationCreated={invalidateDashboard}
                  />
                }
              />
            </div>

            {role === "member" &&
            (summary.data.smartContext.pendingApprovalCount ?? 0) > 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                <span className="font-medium text-[#121110]">
                  {summary.data.smartContext.pendingApprovalCount === 1
                    ? "1 expense needs"
                    : `${summary.data.smartContext.pendingApprovalCount} expenses need`}{" "}
                  your approval.
                </span>{" "}
                <Link
                  href="/dashboard/manager/approvals"
                  className="font-bold text-[#E66A45] underline-offset-2 hover:underline"
                >
                  Review
                </Link>
              </div>
            ) : null}

            <InlineAnalyticsCard data={summary.data.analytics} />
          </>
        ) : null}
      </div>

      <DashboardFab />
    </div>
  );
}
