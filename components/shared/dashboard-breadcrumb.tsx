"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useOrganizationContext } from "@/hooks/use-organization-context";

interface OrganizationData {
  id: string;
  name: string;
}

interface OrgContext {
  orgId: string;
  isOrgPage: boolean;
  currentSection: string;
}

interface DashboardBreadcrumbProps {
  orgContext: OrgContext | null;
  userOrg: OrganizationData | null;
}

// Utility function to capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function DashboardBreadcrumb({
  orgContext,
  userOrg,
}: DashboardBreadcrumbProps) {
  const pathname = usePathname();

  const breadcrumbs: Array<{
    label: string;
    href?: string;
    isCurrent?: boolean;
  }> = [];

  // Always start with Dashboard
  breadcrumbs.push({
    label: "Dashboard",
    href: "/dashboard",
  });

  // Check if we're on an organization page
  if (orgContext?.isOrgPage && orgContext.orgId) {
    const orgName = userOrg?.name || "Organization";
    breadcrumbs.push({
      label: orgName,
      href: `/dashboard/organizations/${orgContext.orgId}`,
    });

    if (orgContext.currentSection !== "overview") {
      breadcrumbs.push({
        label: capitalize(orgContext.currentSection),
        isCurrent: true,
      });
    } else {
      // Organization overview is current page
      breadcrumbs[breadcrumbs.length - 1].isCurrent = true;
      breadcrumbs[breadcrumbs.length - 1].href = undefined;
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.label}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isCurrent ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href!}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
