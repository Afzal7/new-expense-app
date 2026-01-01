"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { orgClient } from "@/lib/auth-client";
import type { Invitation } from "better-auth/plugins/organization";
import { toast } from "@/lib/toast";

export interface InvitationWithDetails extends Invitation {
  organizationName?: string;
  inviterName?: string;
  inviterEmail?: string;
}

/**
 * Custom hook for fetching a specific invitation by ID
 * Used when users visit invitation links
 *
 * @param invitationId - The invitation ID to fetch
 * @returns Query result with invitation details
 */
export function useInvitation(invitationId: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["invitation", invitationId],
    queryFn: async (): Promise<InvitationWithDetails | null> => {
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await orgClient.getInvitation({
        query: { id: invitationId },
      });

      if (error) {
        throw new Error(error.message || "Failed to fetch invitation");
      }

      if (!data) return null;

      // Fetch organization details if available
      let organizationName: string | undefined;
      let inviterName: string | undefined;
      let inviterEmail: string | undefined;

      if (data.organizationId) {
        try {
          const { data: orgData } = await orgClient.getFullOrganization({
            query: { organizationId: data.organizationId },
          });
          organizationName = orgData?.name;

          // Find inviter in members
          if (orgData?.members && data.inviterId) {
            const inviter = orgData.members.find(
              (m) => m.userId === data.inviterId
            );
            inviterName = inviter?.user?.name;
            inviterEmail = inviter?.user?.email;
          }
        } catch {
          // Organization details not available, continue without them
        }
      }

      return {
        ...data,
        organizationName,
        inviterName,
        inviterEmail,
      };
    },
    enabled: !!session?.user?.id && !!invitationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Mutation hook for accepting an organization invitation
 * Includes cache invalidation and navigation handling
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string }) => {
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await orgClient.acceptInvitation({
        invitationId,
      });

      if (error) {
        throw new Error(error.message || "Failed to accept invitation");
      }

      return { invitationId };
    },
    onSuccess: (_data: unknown, variables: { invitationId: string }) => {
      // Remove the accepted invitation from cache
      queryClient.removeQueries({
        queryKey: ["invitation", variables.invitationId],
      });

      // Invalidate organizations list since user is now a member
      queryClient.invalidateQueries({
        queryKey: ["user-organizations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });

      // The invitation data might contain organization info for prefetching
      const invitationData = queryClient.getQueryData([
        "invitation",
        variables.invitationId,
      ]) as Invitation | undefined;
      if (invitationData?.organizationId) {
        // Prefetch the new organization's data
        queryClient.prefetchQuery({
          queryKey: ["organization-members", invitationData.organizationId],
          queryFn: async () => {
            const { data } = await orgClient.getFullOrganization({
              query: { organizationId: invitationData.organizationId },
            });
            return data;
          },
          staleTime: 2 * 60 * 1000,
        });
      }

      toast.success("Invitation accepted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to accept invitation");
    },
  });
}

/**
 * Mutation hook for rejecting an organization invitation
 * Includes cache cleanup
 */
export function useRejectInvitation() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string }) => {
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await orgClient.rejectInvitation({
        invitationId,
      });

      if (error) {
        throw new Error(error.message || "Failed to reject invitation");
      }

      return { invitationId };
    },
    onSuccess: (_data: unknown, variables: { invitationId: string }) => {
      // Remove the rejected invitation from cache
      queryClient.removeQueries({
        queryKey: ["invitation", variables.invitationId],
      });

      // Invalidate user's invitations list
      queryClient.invalidateQueries({
        queryKey: ["user-invitations"],
      });

      toast.success("Invitation rejected successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject invitation");
    },
  });
}
