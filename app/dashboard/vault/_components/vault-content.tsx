'use client';

import { useState } from 'react';
import { usePersonalDrafts } from '@/hooks/use-expense';
import { ExpenseStatus } from '@/types/expense';
import { ExpenseCard } from '@/components/shared/expense-card';
import { SkeletonExpenseCard } from '@/components/ui/skeleton-components';
// Removed unused EditExpense import
import { CreateExpense } from '@/components/features/CreateExpense';
import { Button } from '@/components/ui/button';
import { SuccessGlow } from '@/components/ddd';
import { StaggeredList, StaggeredItem } from '@/components/layout/page-transitions';
import { Lock, Plus } from 'lucide-react';
import Link from 'next/link';

interface VaultExpense {
    _id: string;
    totalAmount: number;
    status: string;
    isPersonal: boolean;
    lineItems: Array<{
        description: string;
        amount: number;
        date: Date;
    }>;
    createdAt: Date;
}

export function VaultContent() {
    const { data: drafts, isLoading, error, refetch } = usePersonalDrafts();
    const [glowingItems, setGlowingItems] = useState<Set<string>>(new Set());

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
                    <p className="text-muted-foreground mb-4">
                        Start capturing your receipts and expenses privately in your vault.
                    </p>

                    {/* Skeleton invitations showing what vault will look like */}
                    <div className="space-y-4 mb-6 max-w-md mx-auto">
                        <p className="text-sm text-muted-foreground">Here&apos;s what your vault will look like:</p>
                        <SkeletonExpenseCard />
                        <SkeletonExpenseCard />
                    </div>

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
            <StaggeredList>
                {drafts?.map((expense: VaultExpense) => (
                    <StaggeredItem key={expense._id}>
                        <SuccessGlow trigger={glowingItems.has(expense._id)}>
                            <ExpenseCard
                                expense={{
                                    ...expense,
                                    status: ExpenseStatus.DRAFT // Vault always shows drafts
                                }}
                                showDelete={false} // Vault doesn't show delete
                                onEditSuccess={() => {
                                    setGlowingItems(prev => new Set([...prev, expense._id]));
                                    setTimeout(() => {
                                        setGlowingItems(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(expense._id);
                                            return newSet;
                                        });
                                    }, 1000);
                                }}
                            />
                        </SuccessGlow>
                    </StaggeredItem>
                ))}
            </StaggeredList>
        </>
    );
}

