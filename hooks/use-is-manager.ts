"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { orgClient } from "@/lib/auth-client";

/**
 * Custom hook to check if the current user is a manager (admin or owner) in their active organization
 * Returns true if the user has admin or owner role, false otherwise
 */
export function useIsManager() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["is-manager", session?.user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!session?.user) {
        return false;
      }

      try {
        const { data, error } = await orgClient.getActiveMemberRole({});

        if (error) {
          // If there's an error (e.g., no active organization), user is not a manager
          return false;
        }

        // Check if the user has admin or owner role
        return data?.role === "admin" || data?.role === "owner";
      } catch {
        // If the call fails, assume user is not a manager
        return false;
      }
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}
