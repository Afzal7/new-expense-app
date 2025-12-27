/**
 * SaaS Dashboard - Starter Template
 */

"use client";

import { useSession } from "@/lib/auth-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { useSubscription } from "@/hooks/use-subscription";
import { useUserOrganizations } from "@/hooks/use-organization-crud";
import { SubscriptionBanner } from "@/components/shared/subscription-banner";

// Import dashboard card components
import { WelcomeCard } from "./_components/welcome-card";
import { QuickActionsCard } from "./_components/quick-actions-card";
import { TeamActivityCard } from "./_components/team-activity-card";
import { ProjectStatusCard } from "./_components/project-status-card";
import { SystemHealthCard } from "./_components/system-health-card";
import { KeyMetricsCard } from "./_components/key-metrics-card";
import { OrganizationCard } from "./_components/organization-card";
import { UsageMetricsCard } from "./_components/usage-metrics-card";

// Sample metrics data
const getSampleMetrics = () => ({
  projectsCount: 12,
  featuresCount: 47,
  membersCount: 3,
});

function DashboardContent() {
  const { data: session } = useSession();
  const { isLoading: subscriptionLoading } = useSubscription();
  const { data: organizations, isLoading: orgsLoading } = useUserOrganizations();

  if (subscriptionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubscriptionBanner />

      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <OrganizationCard
          organizations={organizations}
          isLoading={orgsLoading}
        />
        <WelcomeCard />
        <QuickActionsCard />
        <TeamActivityCard />
        <ProjectStatusCard />
        <SystemHealthCard />
        <KeyMetricsCard />
        <UsageMetricsCard
          metrics={getSampleMetrics()}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}