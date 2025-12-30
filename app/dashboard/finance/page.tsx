import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { FinanceDashboard } from './_components/finance-dashboard';

export default async function FinancePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Finance Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage approved expenses and process reimbursements
                </p>
            </div>

            <Suspense fallback={<div>Loading finance dashboard...</div>}>
                <FinanceDashboard />
            </Suspense>
        </div>
    );
}