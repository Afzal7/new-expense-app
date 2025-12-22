"use client";

import { Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { useRouter } from "next/navigation";
import { CreateOrganizationModal } from "./create-organization-modal";

interface OrganizationCardProps {
  organizations?: Array<{
    id: string;
    name: string;
  }>;
  isLoading: boolean;
}

export function OrganizationCard({
  organizations,
  isLoading,
}: OrganizationCardProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {organizations && organizations.length > 0
            ? "Your Organizations"
            : "Organization Workspace"}
        </CardTitle>
        <CardDescription>
          {organizations && organizations.length > 0
            ? "Manage your team workspaces"
            : "Create a workspace for your team to collaborate"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          </div>
        ) : organizations && organizations.length > 0 ? (
          <div className="space-y-3">
            {organizations.slice(0, 2).map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Organization workspace
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboard/organizations/${org.id}`)
                  }
                >
                  Manage
                </Button>
              </div>
            ))}
            {organizations && organizations.length > 2 && (
              <p className="text-xs text-muted-foreground text-center">
                +{organizations.length - 2} more organizations
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <EmptyState
              icon={Users}
              title="No organizations yet"
              description="Set up an organization to invite team members and manage projects together."
              size="sm"
              variant="inline"
            />
            <CreateOrganizationModal
              trigger={<Button className="w-full">Create Organization</Button>}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
