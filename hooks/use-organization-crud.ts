"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { orgClient } from "@/lib/auth-client";
import { useOrganizationsListQuery } from "@/hooks/use-organization";
import { toast } from "@/lib/toast";

/**
 * Hook to fetch all organizations for the current user
 * (same cache entry as {@link useOrganization} / layout org list).
 */
export function useUserOrganizations() {
  return useOrganizationsListQuery();
}

/**
 * Hook to create a new organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (params: { name: string; slug: string }) => {
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await orgClient.create(params);

      if (error) {
        throw new Error(error.message || "Failed to create organization");
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });

      toast.success(`Organization "${data?.name}" created successfully`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create organization");
    },
  });
}

/**
 * Hook to update an organization
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<
    { organizationId: string; name?: string; slug?: string },
    Error,
    { organizationId: string; name?: string; slug?: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const updateData: { name?: string; slug?: string } = {};
      if (variables.name !== undefined) updateData.name = variables.name;
      if (variables.slug !== undefined) updateData.slug = variables.slug;

      const { error } = await orgClient.update({
        organizationId: variables.organizationId,
        data: updateData,
      });

      if (error) {
        throw new Error(error.message || "Failed to update organization");
      }

      return variables;
    },
    onSuccess: () => {
      toast.success("Organization updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update organization");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["organization-members", variables?.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });
    },
  });
}

/**
 * Hook to delete an organization
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<
    { organizationId: string },
    Error,
    { organizationId: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await orgClient.delete(variables);

      if (error) {
        throw new Error(error.message || "Failed to delete organization");
      }

      return variables;
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete organization");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.removeQueries({
        queryKey: ["organization-members", variables.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });
    },
  });
}

/**
 * Hook to leave an organization
 */
export function useLeaveOrganization() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<
    { organizationId: string },
    Error,
    { organizationId: string }
  >({
    mutationFn: async (variables) => {
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await orgClient.leave(variables);

      if (error) {
        throw new Error(error.message || "Failed to leave organization");
      }

      return variables;
    },
    onSuccess: () => {
      toast.success("Left organization successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to leave organization");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.removeQueries({
        queryKey: ["organization-members", variables.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });
    },
  });
}
