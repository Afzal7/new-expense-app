'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DollarSign, MessageSquare } from 'lucide-react';
import { SuccessGlow } from '@/components/ddd/SuccessGlow';
import { MotionPulse } from '@/components/ddd/MotionPulse';

interface ReimburseExpenseProps {
    expenseId: string;
    expenseTitle?: string;
    variant?: 'button' | 'icon';
    className?: string;
    onExpenseReimbursed?: () => void;
}

export function ReimburseExpense({
    expenseId,
    expenseTitle = 'this expense',
    variant = 'button',
    className,
    onExpenseReimbursed
}: ReimburseExpenseProps) {
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState('');

    const queryClient = useQueryClient();

    const reimburseMutation = useMutation({
        mutationFn: async ({ expenseId, comment }: { expenseId: string; comment?: string }) => {
            const response = await fetch('/api/finance/reimburse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expenseIds: [expenseId], comment }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Reimbursement failed');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['review-queue'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Expense reimbursed successfully!');
            setOpen(false);
            setComment('');
            onExpenseReimbursed?.();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reimburse expense');
        },
    });

    const handleReimburse = async (withComment: boolean) => {
        if (withComment && !comment.trim()) {
            toast.error('Please provide a comment');
            return;
        }

        try {
            await reimburseMutation.mutateAsync({
                expenseId,
                comment: withComment ? comment : undefined,
            });
        } catch (_error) {
            // Error handled by mutation
        }
    };

    const triggerButton = variant === 'button' ? (
        <MotionPulse>
            <Button
                onClick={() => setOpen(true)}
                disabled={reimburseMutation.isPending}
                className={`bg-emerald-600 hover:bg-emerald-700 ${className}`}
            >
                <DollarSign className="h-4 w-4 mr-2" />
                Reimburse
            </Button>
        </MotionPulse>
    ) : (
        <MotionPulse>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                disabled={reimburseMutation.isPending}
                className={className}
            >
                <DollarSign className="h-4 w-4" />
            </Button>
        </MotionPulse>
    );

    return (
        <>
            {triggerButton}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            Reimburse Expense
                        </DialogTitle>
                        <DialogDescription>
                            Mark {expenseTitle} as reimbursed. You can optionally add a comment.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reimbursement-comment">
                                <MessageSquare className="h-4 w-4 inline mr-2" />
                                Comment (Optional)
                            </Label>
                            <Textarea
                                id="reimbursement-comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add any notes about this reimbursement..."
                                disabled={reimburseMutation.isPending}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={reimburseMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleReimburse(false)}
                            disabled={reimburseMutation.isPending}
                            variant="outline"
                        >
                            {reimburseMutation.isPending ? 'Processing...' : 'Reimburse Without Comment'}
                        </Button>
                        <SuccessGlow>
                            <Button
                                onClick={() => handleReimburse(true)}
                                disabled={reimburseMutation.isPending || !comment.trim()}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {reimburseMutation.isPending ? 'Processing...' : 'Reimburse with Comment'}
                            </Button>
                        </SuccessGlow>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}