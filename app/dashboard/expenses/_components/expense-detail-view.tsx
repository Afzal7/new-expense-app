'use client';

import { useState } from 'react';
import { useExpense } from '@/hooks/use-expense';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { ExpenseStatus } from '@/types/expense';
import { EditExpenseDialog } from './edit-expense-dialog';

interface ExpenseDetailViewProps {
    expenseId: string;
}

export function ExpenseDetailView({ expenseId }: ExpenseDetailViewProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const { data: expense, isLoading, error } = useExpense(expenseId);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/expenses">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Expenses
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="h-4 bg-muted rounded animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !expense) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/expenses">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Expenses
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Not Found</CardTitle>
                        <CardDescription>
                            The expense you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/expenses">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Expenses
                    </Link>
                </Button>
                <div className="flex-1" />
                {expense.status === ExpenseStatus.DRAFT && (
                    <Button onClick={() => setEditDialogOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Expense
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">
                                        ${expense.totalAmount.toFixed(2)}
                                    </CardTitle>
                                    <CardDescription>
                                        Expense #{expense._id}
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant={
                                        expense.status === ExpenseStatus.APPROVED ? 'default' :
                                        expense.status === ExpenseStatus.REJECTED ? 'destructive' :
                                        expense.status === ExpenseStatus.SUBMITTED ? 'secondary' :
                                        'outline'
                                    }
                                >
                                    {expense.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {expense.lineItems.map((item: { description: string; amount: number; date: Date; attachments?: Array<{ url: string; name: string; type: string }> }, index: number) => (
                                <div key={index} className="space-y-3">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{item.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(item.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p className="font-semibold">${item.amount.toFixed(2)}</p>
                                    </div>

                                    {/* Show attachments for this line item */}
                                    {item.attachments && item.attachments.length > 0 && (
                                        <div className="ml-4 space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Attachments:</p>
                                            <div className="space-y-1">
                                                {item.attachments.map((attachment: { url: string; name: string; type: string }, attachIndex: number) => (
                                                    <a
                                                        key={attachIndex}
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 underline block"
                                                    >
                                                        {attachment.name || `Receipt ${attachIndex + 1}`}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                <p>{new Date(expense.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                <p>{new Date(expense.updatedAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Type</p>
                                <p>{expense.isPersonal ? 'Personal' : 'Organization'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <EditExpenseDialog
                expenseId={expenseId}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />
        </div>
    );
}