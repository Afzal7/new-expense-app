import { Suspense } from 'react';
import { ExpenseDetailView } from '../_components/expense-detail-view';

interface ExpenseDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<div>Loading expense details...</div>}>
            <ExpenseDetailView expenseId={id} />
        </Suspense>
    );
}