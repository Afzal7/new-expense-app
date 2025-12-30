'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { XCircle, MessageSquare, AlertTriangle } from 'lucide-react';

interface RejectExpenseProps {
    expenseId: string;
    expenseTitle?: string;
    variant?: 'button' | 'icon';
    className?: string;
    onExpenseRejected?: () => void;
}

export function RejectExpense({
    expenseId,
    expenseTitle = 'this expense',
    variant = 'button',
    className,
    onExpenseRejected
}: RejectExpenseProps) {
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState('');

    const queryClient = useQueryClient();

    const rejectMutation = useMutation({
        mutationFn: async ({ expenseId, comment }: { expenseId: string; comment: string }) => {
            if (!comment.trim()) {
                throw new Error('Rejection comment is required');
            }

            const response = await fetch('/api/review-queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expenseId, action: 'reject', comment }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Rejection failed');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['review-queue'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Expense rejected successfully');
            setOpen(false);
            setComment('');
            onExpenseRejected?.();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject expense');
        },
    });

    const handleReject = async () => {
        if (!comment.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            await rejectMutation.mutateAsync({ expenseId, comment });
        } catch (_error) {
            // Error handled by mutation
        }
    };

    const triggerButton = variant === 'button' ? (
        <Button
            variant="destructive"
            onClick={() => setOpen(true)}
            disabled={rejectMutation.isPending}
            className={className}
        >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
        </Button>
    ) : (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            disabled={rejectMutation.isPending}
            className={className}
        >
            <XCircle className="h-4 w-4" />
        </Button>
    );

    return (
        <>
            {triggerButton}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Reject Expense
                        </DialogTitle>
                        <DialogDescription>
                            Reject {expenseTitle}. Please provide a reason for the rejection.
                            The submitter will be able to make corrections and resubmit.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejection-comment" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Rejection Reason <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="rejection-comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Please explain why this expense is being rejected..."
                                disabled={rejectMutation.isPending}
                                rows={4}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                This reason will be visible to the expense submitter to help them correct and resubmit.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={rejectMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={rejectMutation.isPending || !comment.trim()}
                            variant="destructive"
                        >
                            {rejectMutation.isPending ? 'Rejecting...' : 'Reject Expense'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}