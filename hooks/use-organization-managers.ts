import { useQuery } from '@tanstack/react-query';

export interface OrganizationManager {
    id: string;
    name: string;
    email: string;
    role: string;
}

/**
 * Hook to fetch organization managers (admins and owners)
 * @param organizationId - The organization ID to fetch managers for
 * @param enabled - Whether the query should run (default: true if orgId exists)
 */
export function useOrganizationManagers(organizationId?: string, enabled: boolean = !!organizationId) {
    return useQuery({
        queryKey: ['organization-managers', organizationId],
        queryFn: async (): Promise<OrganizationManager[]> => {
            if (!organizationId) return [];

            const response = await fetch(`/api/organizations/managers?organizationId=${organizationId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch managers');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to load managers');
            }

            // Filter out current user and include only managers/admins
            return data.managers.filter((manager: any) =>
                manager.role === 'admin' || manager.role === 'owner'
            );
        },
        enabled,
    });
}