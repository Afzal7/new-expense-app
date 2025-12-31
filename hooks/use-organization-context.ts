"use client";

import { usePathname } from "next/navigation";

// This hook is only used for dashboard breadcrumbs component
export function useOrganizationContext() {
  const pathname = usePathname();
  const orgMatch = pathname.match(/^\/dashboard\/organizations\/([^\/]+)/);

  if (!orgMatch) return null;

  const orgId = orgMatch[1];
  const isOrgPage = pathname.startsWith(`/dashboard/organizations/${orgId}`);

  // Better section detection
  const pathParts = pathname.split("/").filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];

  // If we're at /dashboard/organizations/[id], it's overview
  // If we're deeper, use the last part as section
  const currentSection =
    pathParts.length === 3 ? "overview" : lastPart || "overview";

  return {
    orgId,
    isOrgPage,
    currentSection,
  };
}
