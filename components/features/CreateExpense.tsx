'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExpenseFormDialog } from '@/components/shared/expense-form-dialog';

interface CreateExpenseProps {
    variant?: 'button' | 'icon';
    className?: string;
    children?: React.ReactNode;
}

export function CreateExpense({ variant = 'button', className, children }: CreateExpenseProps) {
    const [open, setOpen] = useState(false);

    const triggerButton = children ? (
        <div onClick={() => setOpen(true)} className={className}>
            {children}
        </div>
    ) : variant === 'button' ? (
        <Button onClick={() => setOpen(true)} className={className}>
            <Plus className="h-4 w-4 mr-2" />
            Create Expense
        </Button>
    ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className={className}>
            <Plus className="h-4 w-4" />
        </Button>
    );

    return (
        <>
            {triggerButton}
            <ExpenseFormDialog
                mode="create"
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}