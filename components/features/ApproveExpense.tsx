'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle, MessageSquare } from 'lucide-react';

interface ApproveExpenseProps {
    expenseId: string;
    expenseTitle?: string;
    variant?: 'button' | 'icon';
    className?: string;
    onExpenseApproved?: () => void;
}

export function ApproveExpense({
    expenseId,
    expenseTitle = 'this expense',
    variant = 'button',
    className,
    onExpenseApproved
}: ApproveExpenseProps) {
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState('');

    const queryClient = useQueryClient();

    const approveMutation = useMutation({
        mutationFn: async ({ expenseId, comment }: { expenseId: string; comment?: string }) => {
            const response = await fetch('/api/review-queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expenseId, action: 'approve', comment }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Approval failed');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['review-queue'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Expense approved successfully!');
            setOpen(false);
            setComment('');
            onExpenseApproved?.();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve expense');
        },
    });

    const handleApprove = async (withComment: boolean) => {
        if (withComment && !comment.trim()) {
            toast.error('Please provide a comment');
            return;
        }

        try {
            await approveMutation.mutateAsync({
                expenseId,
                comment: withComment ? comment : undefined,
            });
        } catch (_error) {
            // Error handled by mutation
        }
    };

    const triggerButton = variant === 'button' ? (
        <Button
            onClick={() => setOpen(true)}
            disabled={approveMutation.isPending}
            className={`bg-green-600 hover:bg-green-700 ${className}`}
        >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
        </Button>
    ) : (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            disabled={approveMutation.isPending}
            className={className}
        >
            <CheckCircle className="h-4 w-4" />
        </Button>
    );

    return (
        <>
            {triggerButton}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Approve Expense
                        </DialogTitle>
                        <DialogDescription>
                            Approve {expenseTitle} for reimbursement. You can optionally add a comment.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="approval-comment">
                                <MessageSquare className="h-4 w-4 inline mr-2" />
                                Comment (Optional)
                            </Label>
                            <Textarea
                                id="approval-comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add any notes about this approval..."
                                disabled={approveMutation.isPending}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={approveMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleApprove(false)}
                            disabled={approveMutation.isPending}
                            variant="outline"
                        >
                            {approveMutation.isPending ? 'Approving...' : 'Approve Without Comment'}
                        </Button>
                        <Button
                            onClick={() => handleApprove(true)}
                            disabled={approveMutation.isPending || !comment.trim()}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {approveMutation.isPending ? 'Approving...' : 'Approve with Comment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}