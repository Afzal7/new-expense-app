'use client';

import { usePersonalDrafts } from '@/hooks/use-expense';
import { ExpenseStatus } from '@/types/expense';
import { ExpenseCard } from '@/components/shared/expense-card';
import { SkeletonExpenseCard } from '@/components/ui/skeleton-components';
// Removed unused EditExpense import
import { CreateExpense } from '@/components/features/CreateExpense';
import { Button } from '@/components/ui/button';
// Removed unused useState import
import { Lock, Plus } from 'lucide-react';
import Link from 'next/link';

interface Expense {
    _id: string;
    totalAmount: number;
    status: string; // Keep as string for vault (always 'DRAFT')
    isPersonal: boolean;
    lineItems: Array<{
        description: string;
        amount: number;
        date: Date;
    }>;
    createdAt: Date;
}

export function VaultContent() {
    const { data: drafts, isLoading, error } = usePersonalDrafts();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <SkeletonExpenseCard key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load your drafts</p>
                <p className="text-sm text-muted-foreground">Please try again in a moment</p>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </div>
        );
    }

    if (!drafts || drafts.length === 0) {
        return (
            <>
                <div className="text-center py-12">
                    <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-label="Secure vault lock icon" />
                    <h3 className="text-lg font-semibold mb-2">Your vault is empty</h3>
                    <p className="text-muted-foreground mb-6">
                        Start capturing your receipts and expenses privately in your vault.
                    </p>
                    <div className="flex gap-2">
                        <CreateExpense>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Capture First Expense
                            </Button>
                        </CreateExpense>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/expenses">
                                View All Expenses
                            </Link>
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {drafts.map((expense: Expense) => (
                    <ExpenseCard
                        key={expense._id}
                        expense={{
                            ...expense,
                            status: ExpenseStatus.DRAFT // Vault always shows drafts
                        }}
                        showDelete={false} // Vault doesn't show delete
                        onEditSuccess={() => {
                            // Optionally refresh vault data
                        }}
                    />
                ))}
            </div>
        </>
    );
}

