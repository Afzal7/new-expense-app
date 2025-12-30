import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { OrganizationProvider } from '@/hooks/use-organization-context';
import { OrganizationLayout } from './_components/organization-layout';
import { organizationService } from '@/lib/services/organizationService';

interface OrganizationLayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export default async function OrgLayout({ children, params }: OrganizationLayoutProps) {
    const { id: orgId } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect('/login');
    }

    // Verify user has access to this organization
    const member = await organizationService.findMember(orgId, session.user.id);

    if (!member) {
        // User is not a member of this organization
        notFound(); // This will show a 404 or custom not-found page
    }

    // Get organization details
    const organization = await organizationService.findOrganizationById(orgId);

    if (!organization) {
        notFound();
    }

    const orgContext = {
        orgId,
        organization: {
            id: organization._id.toString(),
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
            createdAt: organization.createdAt,
        },
        member: {
            role: member.role,
            joinedAt: member.createdAt,
        },
        isOrgPage: true,
        currentSection: 'overview', // Default to overview, will be updated by useOrganizationContext
    };

    return (
        <OrganizationProvider value={orgContext}>
            <OrganizationLayout>
                {children}
            </OrganizationLayout>
        </OrganizationProvider>
    );
}