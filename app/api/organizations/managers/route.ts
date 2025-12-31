import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { organizationService } from '@/lib/services/organizationService';
import { createSuccessResponse, createUnauthorizedResponse, createBadRequestResponse, createForbiddenResponse, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user) {
            return createUnauthorizedResponse();
        }

        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');

        if (!organizationId) {
            return createBadRequestResponse('Organization ID required');
        }

        // Verify user is a member of the organization
        const member = await organizationService.findMember(organizationId, session.user.id);
        if (!member) {
            return createForbiddenResponse('Not a member of this organization');
        }

        // Get all organization members
        const members = await organizationService.getOrganizationMembers(organizationId);

        // Filter to admins and owners (they can be managers), exclude current user
        const managers = members
            .filter(m => (m.role === 'admin' || m.role === 'owner') && m.userId.toString() !== session.user.id)
            .map(m => ({
                id: m.userId.toString(),
                name: m.user?.name || 'Unknown User',
                email: m.user?.email || '',
                role: m.role
            }));

        return createSuccessResponse({ managers });
    } catch (error) {
        return handleApiError(error, 'organization managers API');
    }
}