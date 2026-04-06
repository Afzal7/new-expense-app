"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { useActiveMember } from "@/hooks/use-active-member";
import { toOrganizationIdString } from "@/lib/utils/organization-id";
import {
  dashboardSummaryResponseSchema,
  type DashboardSummaryResponse,
} from "@/lib/validations/dashboard-summary";

async function fetchDashboardSummary(): Promise<DashboardSummaryResponse> {
  const res = await fetch("/api/dashboard/summary", {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      typeof err?.error?.message === "string"
        ? err.error.message
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  const json: unknown = await res.json();
  return dashboardSummaryResponseSchema.parse(json);
}

function readActiveOrganizationId(
  session:
    | { session?: unknown; activeOrganizationId?: unknown }
    | null
    | undefined
): string | null {
  if (!session) {
    return null;
  }
  if (session.session && typeof session.session === "object") {
    const nested = (session.session as { activeOrganizationId?: unknown })
      .activeOrganizationId;
    const fromNested = toOrganizationIdString(nested);
    if (fromNested) {
      return fromNested;
    }
  }
  return toOrganizationIdString(session.activeOrganizationId);
}

/**
 * Dashboard aggregates; refetch when user or active org membership changes.
 */
export function useDashboardSummary() {
  const { data: session } = useSession();
  const { data: activeMember } = useActiveMember();
  const fromSession = readActiveOrganizationId(session);
  const activeOrganizationId =
    fromSession ?? activeMember?.organizationId ?? null;

  return useQuery({
    queryKey: [
      "dashboard-summary",
      session?.user?.id ?? null,
      activeOrganizationId,
    ],
    queryFn: fetchDashboardSummary,
    enabled: Boolean(session?.user?.id),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
