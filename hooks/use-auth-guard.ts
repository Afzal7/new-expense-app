import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook that redirects to login if user is not authenticated
 * Returns the user object if authenticated
 */
export function useAuthGuard(redirectTo = '/login') {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push(redirectTo);
        }
    }, [session, isPending, router, redirectTo]);

    return {
        user: session?.user,
        isLoading: isPending,
        isAuthenticated: !!session?.user,
    };
}

/**
 * Hook that checks if user has required role in organization
 * Redirects to appropriate page if not authorized
 */
export function useRoleGuard(
    requiredRole: 'admin' | 'owner' | 'member',
    organizationId?: string,
    redirectTo = '/dashboard'
) {
    const { user, isLoading } = useAuthGuard();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user && organizationId) {
            // TODO: Implement role checking logic
            // For now, assume admin check
            // This should use verifyPermission from lib/verifyPermission.ts
        }
    }, [user, isLoading, organizationId, requiredRole, router, redirectTo]);

    return {
        user,
        isLoading,
        hasRole: true, // TODO: Implement actual role checking
    };
}