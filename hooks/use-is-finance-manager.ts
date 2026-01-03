"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { orgClient } from "@/lib/auth-client";

/**
 * Custom hook to check if the current user is a finance manager (admin or owner) in their active organization
 * Finance managers can process reimbursements and handle financial operations
 * Returns true if the user has admin or owner role, false otherwise
 */
export function useIsFinanceManager() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["is-finance-manager", session?.user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!session?.user) {
        return false;
      }

      try {
        // Try to get the active member information
        const { data, error } = await orgClient.getActiveMember({});

        if (error || !data) {
          return false;
        }

        // Check if the user has admin or owner role (finance managers)
        return data.role === "admin" || data.role === "owner";
      } catch {
        // If the call fails, assume user is not a finance manager
        return false;
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}
