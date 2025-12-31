import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { OrganizationLayout } from './_components/organization-layout';

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

    return (
        <OrganizationLayout>
            {children}
        </OrganizationLayout>
    );
}