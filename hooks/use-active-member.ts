"use client";

import { useQuery } from "@tanstack/react-query";
import { orgClient, useSession } from "@/lib/auth-client";

export type OrganizationRole = "owner" | "admin" | "member";

/**
 * Active org membership for the current session (same source as sidebar / approvals).
 */
export function useActiveMember() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["active-member", session?.user?.id],
    queryFn: async (): Promise<{
      role: OrganizationRole;
      organizationId: string;
    } | null> => {
      if (!session?.user) {
        return null;
      }
      const { data, error } = await orgClient.getActiveMember();
      if (error || !data) {
        return null;
      }
      const role = data.role;
      if (role !== "owner" && role !== "admin" && role !== "member") {
        return null;
      }
      return {
        role,
        organizationId: data.organizationId,
      };
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
