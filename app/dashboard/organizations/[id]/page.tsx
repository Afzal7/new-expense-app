'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useOrganizationById } from '@/hooks/use-organization';
import { useFeatureGate } from '@/hooks/use-feature-gate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, Mail, Settings, Crown, Info } from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import type { Organization, Member } from 'better-auth/plugins/organization';

export default function OrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { isPro } = useFeatureGate();
  const orgId = params.id as string;

  const { data: orgData, isLoading, error } = useOrganizationById(orgId);

  // Extract data from Better Auth response format
  const organization = orgData ? { ...orgData, members: undefined, invitations: undefined } : null;
  const members = orgData?.members || [];
  const invitations = orgData?.invitations || [];
  const currentMember = members.find(m => m.userId === session?.user?.id) || null;



  if (isLoading) {
    return <LoadingSkeleton type="page" count={4} />;
  }

  if (error || !organization) {
    return (
      <div className="space-y-6">
        <ErrorState
          message={error instanceof Error ? error.message : 'This organization may not exist or you may not have access.'}
          type="page"
          onRetry={() => window.location.reload()}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  const isOwner = currentMember?.role === 'owner';
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold capitalize">{organization.name}</h1>
          <p className="text-muted-foreground">Manage your organization workspace</p>
        </div>
        <Badge variant={isOwner ? 'default' : 'secondary'} className="flex items-center gap-1">
          <Crown className="h-3 w-3" />
          {isOwner ? 'Owner' : 'Member'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvitations.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting acceptance
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/organizations/${orgId}/members`)}
                className="justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/organizations/${orgId}/invitations`)}
                className="justify-start"
              >
                <Mail className="h-4 w-4 mr-2" />
                View Invitations
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/organizations/${orgId}/settings`)}
                className="justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Organization Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isPro && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Your organization is on the Free plan.</strong> Upgrade to Pro plan to unlock unlimited members and advanced features.
          </AlertDescription>
        </Alert>
      )}


    </div>
  );
}