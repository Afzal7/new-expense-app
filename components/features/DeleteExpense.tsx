'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useDeleteExpense } from '@/hooks/use-expense';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteExpenseProps {
    expenseId: string;
    expenseTitle?: string;
    variant?: 'button' | 'icon' | 'destructive';
    className?: string;
    onSuccess?: () => void;
}

export function DeleteExpense({
    expenseId,
    expenseTitle = 'this expense',
    variant = 'button',
    className,
    onSuccess
}: DeleteExpenseProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const deleteExpenseMutation = useDeleteExpense();

    const handleDelete = () => {
        deleteExpenseMutation.mutate(expenseId, {
            onSuccess: () => {
                toast.success('Expense deleted successfully');
                onSuccess?.();
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to delete expense');
            },
            onSettled: () => {
                setShowConfirm(false);
            },
        });
    };

    const triggerButton = variant === 'destructive' ? (
        <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={deleteExpenseMutation.isPending}
            className={className}
        >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
        </Button>
    ) : variant === 'icon' ? (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={deleteExpenseMutation.isPending}
            className={className}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    ) : (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={deleteExpenseMutation.isPending}
            className={className}
        >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Expense
        </Button>
    );

    return (
        <>
            {triggerButton}

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Expense
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {expenseTitle}? This action cannot be undone.
                            All associated receipts and data will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteExpenseMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteExpenseMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteExpenseMutation.isPending ? 'Deleting...' : 'Delete Expense'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}