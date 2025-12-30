'use client';

import { useExpenses } from '@/hooks/use-expense';
import { ExpenseCard } from '@/components/shared/expense-card';
import { SkeletonExpenseCard } from '@/components/ui/skeleton-components';
import { StaggeredList, StaggeredItem } from '@/components/layout/page-transitions';
import { FileText } from 'lucide-react';
import { ExpenseStatus } from '@/types/expense';

type Expense = {
    _id: string;
    totalAmount: number;
    status: ExpenseStatus;
    isPersonal: boolean;
    lineItems: Array<{
        description: string;
        amount: number;
        date: Date;
    }>;
    createdAt: Date;
};

export function ExpenseList() {
    const { data, isLoading, error } = useExpenses();

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
                <p className="text-muted-foreground">Failed to load expenses</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                <p className="text-muted-foreground mb-4">
                    Create your first expense to get started
                </p>
            </div>
        );
    }

    return (
        <StaggeredList className="space-y-4">
            {data.map((expense: Expense) => (
                <StaggeredItem key={expense._id}>
                    <ExpenseCard expense={expense} />
                </StaggeredItem>
            ))}
        </StaggeredList>
    );
}