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
            // Extra safety check - if no organizationId, don't make the request
            if (!organizationId || organizationId.trim() === '') {
                return [];
            }

            try {
                const response = await fetch(`/api/organizations/managers?organizationId=${organizationId}`);

                if (!response.ok) {
                    if (response.status === 403) {
                        // Forbidden - user not a member
                        console.warn('useOrganizationManagers: User not authorized for this organization');
                        return [];
                    }
                    if (response.status === 400) {
                        // Bad request - organizationId not provided or invalid
                        console.warn('useOrganizationManagers: Bad request, organizationId may be invalid');
                        return [];
                    }
                    // For other errors, throw
                    throw new Error(`Failed to fetch managers: ${response.status}`);
                }

                const data = await response.json();
                if (!data.success) {
                    console.error('useOrganizationManagers: API returned error:', data.error);
                    return []; // Return empty array instead of throwing
                }

                // Filter out current user and include only managers/admins
                return data.managers.filter((manager: OrganizationManager) =>
                    manager.role === 'admin' || manager.role === 'owner'
                );
            } catch (error) {
                console.error('useOrganizationManagers: Fetch error:', error);
                // Return empty array on error to prevent UI breakage
                return [];
            }
        },
        enabled: enabled && !!organizationId && organizationId.trim() !== '',
        retry: false, // Disable retries to prevent repeated failed requests
    });
}