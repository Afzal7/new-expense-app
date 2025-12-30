'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteExpenseAction } from '../../app/dashboard/expenses/_actions/edit-actions';
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
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteExpenseAction(expenseId);
            if (result.success) {
                toast.success('Expense deleted successfully');
                onSuccess?.();
            } else {
                toast.error(result.error || 'Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    const triggerButton = variant === 'destructive' ? (
        <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
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
            disabled={isDeleting}
            className={className}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    ) : (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
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
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Expense'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}