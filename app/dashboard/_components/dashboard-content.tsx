"use client";

import { useSession } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";

import { useSubscription } from "@/hooks/use-subscription";
import { useUserOrganizations } from "@/hooks/use-organization-crud";
import { SubscriptionBanner } from "@/components/shared/subscription-banner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

// Import dashboard card components
import { WelcomeCard } from "./welcome-card";
import { QuickActionsCard } from "./quick-actions-card";
import { TeamActivityCard } from "./team-activity-card";
import { ProjectStatusCard } from "./project-status-card";
import { SystemHealthCard } from "./system-health-card";
import { KeyMetricsCard } from "./key-metrics-card";
import { OrganizationCard } from "./organization-card";
import { UsageMetricsCard } from "./usage-metrics-card";

// Sample metrics data
const getSampleMetrics = () => ({
    projectsCount: 12,
    featuresCount: 47,
    membersCount: 3,
});

interface DashboardContentProps {
    error?: string;
}

export function DashboardContent({ error }: DashboardContentProps) {
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

        {error && (
            <Alert variant={error === 'org-not-found' ? 'destructive' : 'default'}>
                {error === 'org-not-found' ? (
                    <AlertCircle className="h-4 w-4" />
                ) : (
                    <Info className="h-4 w-4" />
                )}
                <AlertDescription>
                    {error === 'org-not-found' && 'The organization you were trying to access does not exist.'}
                    {error === 'org-access-denied' && 'You do not have access to that organization.'}
                </AlertDescription>
            </Alert>
        )}

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
