'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Clock, Filter, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { ExpenseStatus } from '@/types/expense';
import { useReviewQueueFiltered, useApproveExpense, type ReviewQueueExpense } from '@/hooks/use-review-queue';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';

interface ReviewQueueFilters {
    employee?: string;
    status?: ExpenseStatus;
    dateRange?: string;
}

export function ReviewQueueContent() {
    const pathname = usePathname();
    const orgId = pathname?.split('/')[3]; // Extract org ID from /dashboard/organizations/[id]/review-queue
    const [filters, setFilters] = useState<ReviewQueueFilters>({});
    const [reviewDialog, setReviewDialog] = useState<{
        open: boolean;
        expense: ReviewQueueExpense | null;
        action: 'approve' | 'reject' | null;
    }>({ open: false, expense: null, action: null });
    const [reviewComment, setReviewComment] = useState('');

    const { data: expensesData, isLoading, error } = useReviewQueueFiltered(
        orgId,
        filters
    );

    const expenses = expensesData || [];

    const reviewMutation = useApproveExpense();

    // Extract unique employees from expenses data
    const employeeMap = new Map<string, NonNullable<ReviewQueueExpense['user']>>();
    if (expenses) {
        expenses.forEach((expense: ReviewQueueExpense) => {
            if (expense.user && !employeeMap.has(expense.userId)) {
                employeeMap.set(expense.userId, expense.user);
            }
        });
    }
    const employees = Array.from(employeeMap.values());

    if (isLoading) {
        return <ReviewQueueSkeleton />;
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Failed to load review queue</p>
                        <p className="text-sm text-muted-foreground">{error.message}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const pendingExpenses = expenses?.filter((expense: ReviewQueueExpense) =>
        expense.status === ExpenseStatus.SUBMITTED ||
        expense.status === ExpenseStatus.PRE_APPROVED
    ) || [];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Employee</label>
                            <Select
                                value={filters.employee || 'all'}
                                onValueChange={(value) =>
                                    setFilters(prev => ({ ...prev, employee: value === 'all' ? undefined : value }))
                                }
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All employees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Employees</SelectItem>
                                    {employees.map(employee => (
                                        <SelectItem key={employee.email} value={employee.email}>
                                            {employee.name} ({employee.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) =>
                                    setFilters(prev => ({
                                        ...prev,
                                        status: value === 'all' ? undefined : value as ExpenseStatus
                                    }))
                                }
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value={ExpenseStatus.SUBMITTED}>Submitted</SelectItem>
                                    <SelectItem value={ExpenseStatus.PRE_APPROVED}>Pre-Approved</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <Select
                                value={filters.dateRange || 'all'}
                                onValueChange={(value) =>
                                    setFilters(prev => ({ ...prev, dateRange: value === 'all' ? undefined : value }))
                                }
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Review Queue */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Pending Reviews ({pendingExpenses.length})
                    </CardTitle>
                    <CardDescription>
                        Expenses awaiting your approval
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingExpenses.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                            <p className="text-muted-foreground">
                                No expenses are currently pending your review.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingExpenses.map((expense: ReviewQueueExpense) => (
                                <Card key={expense._id} className="border-l-4 border-l-amber-500">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">
                                                        ${expense.totalAmount.toFixed(2)}
                                                    </h3>
                                                    <Badge variant="secondary">
                                                        {expense.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Submitted by {expense.user?.name || expense.user?.email || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {expense.lineItems.length} item{expense.lineItems.length !== 1 ? 's' : ''} •
                                                    {new Date(expense.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/dashboard/expenses/${expense._id}`}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => setReviewDialog({
                                                        open: true,
                                                        expense,
                                                        action: 'approve'
                                                    })}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setReviewDialog({
                                                        open: true,
                                                        expense,
                                                        action: 'reject'
                                                    })}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog
                open={reviewDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        setReviewDialog({ open: false, expense: null, action: null });
                        setReviewComment('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'} Expense
                        </DialogTitle>
                        <DialogDescription>
                            {reviewDialog.expense && (
                                <>Review expense for ${reviewDialog.expense.totalAmount.toFixed(2)} submitted by {reviewDialog.expense.user?.name || reviewDialog.expense.user?.email}</>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="comment" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comment (Optional)
                            </Label>
                            <Textarea
                                id="comment"
                                placeholder={reviewDialog.action === 'reject'
                                    ? "Please provide a reason for rejection..."
                                    : "Add any notes or approval comments..."
                                }
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReviewDialog({ open: false, expense: null, action: null })}
                            disabled={reviewMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (reviewDialog.expense && reviewDialog.action) {
                                    reviewMutation.mutate({
                                        expenseId: reviewDialog.expense._id,
                                        action: reviewDialog.action,
                                        comment: reviewComment.trim() || undefined,
                                    });
                                }
                            }}
                            disabled={reviewMutation.isPending}
                            variant={reviewDialog.action === 'reject' ? 'destructive' : 'default'}
                        >
                            {reviewMutation.isPending ? 'Processing...' :
                             reviewDialog.action === 'approve' ? 'Approve Expense' : 'Reject Expense'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ReviewQueueSkeleton() {
    return (
        <div className="space-y-6">
            {/* Filters skeleton */}
            <Card>
                <CardHeader>
                    <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="h-10 bg-muted rounded w-48 animate-pulse"></div>
                        <div className="h-10 bg-muted rounded w-48 animate-pulse"></div>
                        <div className="h-10 bg-muted rounded w-48 animate-pulse"></div>
                    </div>
                </CardContent>
            </Card>

            {/* Queue skeleton */}
            <Card>
                <CardHeader>
                    <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-64 animate-pulse mt-2"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between">
                                        <div className="space-y-2">
                                            <div className="h-5 bg-muted rounded w-24"></div>
                                            <div className="h-4 bg-muted rounded w-48"></div>
                                            <div className="h-4 bg-muted rounded w-32"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-8 bg-muted rounded w-16"></div>
                                            <div className="h-8 bg-muted rounded w-20"></div>
                                            <div className="h-8 bg-muted rounded w-18"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}