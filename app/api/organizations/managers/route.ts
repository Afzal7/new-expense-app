import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { organizationService } from '@/lib/services/organizationService';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');

        if (!organizationId) {
            return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
        }

        // Verify user is a member of the organization
        const member = await organizationService.findMember(organizationId, session.user.id);
        if (!member) {
            return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
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

        return NextResponse.json(managers);
    } catch (error) {
        console.error('Error fetching organization managers:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}