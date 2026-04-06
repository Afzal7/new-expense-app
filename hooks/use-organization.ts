"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { orgClient } from "@/lib/auth-client";

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export async function fetchUserOrganizationsList(
  userId: string
): Promise<Organization[]> {
  const { data, error } = await orgClient.list({
    query: { userId },
  });

  if (error) {
    throw new Error(error.message || "Failed to fetch organizations");
  }

  return (data || []) as Organization[];
}

const orgListRetry = (failureCount: number, error: unknown): boolean => {
  if (
    error instanceof Error &&
    error.message.includes("not authenticated")
  ) {
    return false;
  }
  return failureCount < 3;
};

const ORG_LIST_STALE_MS = 5 * 60 * 1000;
const ORG_LIST_GC_MS = 10 * 60 * 1000;

/**
 * Full org list for the session user. Shares cache with {@link useOrganization} (first org).
 */
export function useOrganizationsListQuery() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["organizations", session?.user?.id],
    queryFn: async (): Promise<Organization[]> => {
      if (!session?.user) {
        throw new Error("User not authenticated");
      }
      return fetchUserOrganizationsList(session.user.id);
    },
    enabled: !!session?.user?.id,
    staleTime: ORG_LIST_STALE_MS,
    gcTime: ORG_LIST_GC_MS,
    retry: orgListRetry,
  });
}

/**
 * First organization for the user (single-org assumption). Same list query as {@link useOrganizationsListQuery}.
 */
export function useOrganization() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["organizations", session?.user?.id],
    queryFn: async (): Promise<Organization[]> => {
      if (!session?.user) {
        throw new Error("User not authenticated");
      }
      return fetchUserOrganizationsList(session.user.id);
    },
    select: (list) => (list.length > 0 ? list[0] : null),
    enabled: !!session?.user?.id,
    staleTime: ORG_LIST_STALE_MS,
    gcTime: ORG_LIST_GC_MS,
    retry: orgListRetry,
  });
}
