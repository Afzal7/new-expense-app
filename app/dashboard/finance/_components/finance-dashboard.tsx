'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NumberTicker } from '@/components/ddd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
// Removed unused Select components
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DollarSign,
    Download,
    CheckCircle,
    FileText,
    Calendar,
    User,
    Building2,
    AlertCircle
} from 'lucide-react';
import { ExpenseStatus } from '@/types/expense';
import { useSession } from '@/lib/auth-client';
import { useOrganizationContext } from '@/hooks/use-organization-context';
import { toast } from 'sonner';

interface Expense {
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
    userId: string;
    organizationId?: string;
    user?: {
        name?: string;
        email: string;
    };
}

interface FinanceFilters {
    status?: ExpenseStatus;
    dateRange?: string;
    employee?: string;
}

export function FinanceDashboard() {
    const { data: _session } = useSession();
    const orgContext = useOrganizationContext();
    const [filters, _setFilters] = useState<FinanceFilters>({ status: ExpenseStatus.APPROVED });
    const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
    const [showReimburseDialog, setShowReimburseDialog] = useState(false);

    const queryClient = useQueryClient();

    const { data: expenses, isLoading, error } = useQuery({
        queryKey: ['finance-expenses', orgContext?.orgId, filters],
        queryFn: async () => {
            if (!orgContext?.orgId) return [];

            const params = new URLSearchParams();
            params.set('organizationId', orgContext.orgId);
            if (filters.status) params.set('status', filters.status);
            if (filters.dateRange) params.set('dateRange', filters.dateRange);
            if (filters.employee) params.set('employee', filters.employee);

            const response = await fetch(`/api/finance/expenses?${params}`);
            if (!response.ok) throw new Error('Failed to fetch expenses');

            const result = await response.json();
            return result.success ? result.data : [];
        },
        enabled: !!orgContext?.orgId,
    });

    const reimburseMutation = useMutation({
        mutationFn: async (expenseIds: string[]) => {
            const response = await fetch('/api/finance/reimburse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ expenseIds }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Reimbursement failed');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance-expenses'] });
            setSelectedExpenses(new Set());
            setShowReimburseDialog(false);
            toast.success('Expenses marked as reimbursed successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to process reimbursements');
        },
    });

    const exportMutation = useMutation({
        mutationFn: async (format: 'csv' | 'pdf') => {
            const expenseIds = Array.from(selectedExpenses);
            const response = await fetch('/api/finance/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ format, expenseIds }),
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            // Trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
        onSuccess: () => {
            toast.success('Export completed successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Export failed');
        },
    });

    if (isLoading) {
        return <FinanceDashboardSkeleton />;
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <p className="text-muted-foreground">Failed to load finance dashboard</p>
                        <p className="text-sm text-muted-foreground">{error.message}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const approvedExpenses = expenses?.expenses || [];

    const totalReimbursable = expenses?.totalPayout || 0;

    const handleExpenseSelect = (expenseId: string, checked: boolean) => {
        const newSelected = new Set(selectedExpenses);
        if (checked) {
            newSelected.add(expenseId);
        } else {
            newSelected.delete(expenseId);
        }
        setSelectedExpenses(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedExpenses(new Set(approvedExpenses.map((e: { _id: string }) => e._id)));
        } else {
            setSelectedExpenses(new Set());
        }
    };

    const handleReimburse = () => {
        if (selectedExpenses.size === 0) return;
        setShowReimburseDialog(true);
    };

    const confirmReimburse = () => {
        reimburseMutation.mutate(Array.from(selectedExpenses));
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Expenses</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{approvedExpenses.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Ready for reimbursement
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center">
                            $<NumberTicker value={totalReimbursable} format={(val) => val.toFixed(2)} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Reimbursable this period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Selected</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{selectedExpenses.size}</div>
                        <p className="text-xs text-muted-foreground">
                            Expenses selected for processing
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Expense Management</CardTitle>
                    <CardDescription>
                        Review and process approved expenses for reimbursement
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={selectedExpenses.size === approvedExpenses.length && approvedExpenses.length > 0}
                                onCheckedChange={handleSelectAll}
                            />
                            <label className="text-sm font-medium">Select All</label>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleReimburse}
                                disabled={selectedExpenses.size === 0 || reimburseMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Reimbursed ({selectedExpenses.size})
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => exportMutation.mutate('csv')}
                                disabled={selectedExpenses.size === 0 || exportMutation.isPending}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => exportMutation.mutate('pdf')}
                                disabled={selectedExpenses.size === 0 || exportMutation.isPending}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                            </Button>
                        </div>
                    </div>

                    {/* Expense List */}
                    <div className="space-y-4">
                        {approvedExpenses.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No approved expenses</h3>
                                <p className="text-muted-foreground">
                                    Expenses will appear here once they are approved by managers.
                                </p>
                            </div>
                        ) : (
                            approvedExpenses.map((expense: Expense) => (
                                <Card key={expense._id} className="border-l-4 border-l-green-500">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <Checkbox
                                                    checked={selectedExpenses.has(expense._id)}
                                                    onCheckedChange={(checked) =>
                                                        handleExpenseSelect(expense._id, checked as boolean)
                                                    }
                                                />

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">
                                                            $<NumberTicker value={expense.totalAmount} format={(val) => val.toFixed(2)} />
                                                        </h3>
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                                            Approved
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {expense.user?.name || expense.user?.email}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(expense.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            {expense.lineItems.length} item{expense.lineItems.length !== 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reimbursement Confirmation Dialog */}
            <Dialog open={showReimburseDialog} onOpenChange={setShowReimburseDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Reimbursement</DialogTitle>
                        <DialogDescription>
                            Mark {selectedExpenses.size} expense{selectedExpenses.size !== 1 ? 's' : ''} as reimbursed?
                            This will update their status and log the reimbursement action.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Summary of selected expenses */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Selected Expenses:</span>
                                <span className="text-sm text-muted-foreground">{selectedExpenses.size}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total Amount:</span>
                                <span className="text-lg font-bold text-green-600">
                                    ${approvedExpenses
                                        .filter((expense: Expense) => selectedExpenses.has(expense._id))
                                        .reduce((sum: number, expense: Expense) => sum + expense.totalAmount, 0)
                                        .toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* List of affected employees */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Affected Employees:</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {Array.from(selectedExpenses).map(expenseId => {
                                    const expense = approvedExpenses.find((e: Expense) => e._id === expenseId)
                                    return expense ? (
                                        <div key={expenseId} className="flex justify-between text-sm">
                                            <span>{expense.user?.name || expense.user?.email}</span>
                                            <span className="text-muted-foreground">${expense.totalAmount.toFixed(2)}</span>
                                        </div>
                                    ) : null
                                })}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> This action records that the expenses have been reimbursed externally.
                                The actual payment processing should be handled through your banking system.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowReimburseDialog(false)}
                            disabled={reimburseMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmReimburse}
                            disabled={reimburseMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {reimburseMutation.isPending ? 'Processing...' : 'Confirm Reimbursement'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function FinanceDashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Summary cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2"></div>
                            <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main content skeleton */}
            <Card>
                <CardHeader>
                    <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-64 animate-pulse mt-2"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-10 bg-muted rounded w-full animate-pulse mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <div className="flex justify-between">
                                        <div className="space-y-2">
                                            <div className="h-5 bg-muted rounded w-24"></div>
                                            <div className="h-4 bg-muted rounded w-48"></div>
                                        </div>
                                        <div className="h-8 bg-muted rounded w-20"></div>
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